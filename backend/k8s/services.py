import subprocess
import yaml
import time
import tempfile
import threading

from django.conf import settings
from kubernetes import client

from .models import App, Deployment

def get_k8s_client():
    configuration = client.Configuration()
    configuration.host = settings.K8S_API_SERVER
    configuration.verify_ssl = False
    configuration.api_key = {"authorization": f"Bearer {settings.K8S_TOKEN}"}
    return client.CoreV1Api(client.ApiClient(configuration))

def is_app_running(app):
    v1 = get_k8s_client()
    label_selector = f"app.kubernetes.io/instance={app.name}"
    pods = v1.list_namespaced_pod(namespace=app.namespace, label_selector=label_selector)
    
    for pod in pods.items:
        container_statuses = pod.status.container_statuses or []
        if pod.status.phase == "Running" and all(cs.ready for cs in container_statuses):
            return True
    return False

def deploy_app(app):
    values = {
        "releasePrefix": "-",
        "defaultImage": app.image.split(":")[0],
        "defaultImageTag": app.image.split(":")[1] if ":" in app.image else "latest",
        "deployments": {
            "api": {
                "replicas": app.replicas,
                "containers": [
                    {
                        "name": "app",
                        "ports": [
                            {
                                "containerPort": app.port,
                                "name": "http",
                                "protocol": "TCP"
                            }
                        ],
                        "env": [{"name": k, "value": str(v)} for k, v in app.environment_variables.items()]
                    }
                ]
            }
        },
        "services": {
            "nginx": {
                "type": "ClusterIP",
                "ports": [{
                    "name": "http",
                    "port": app.port,
                    "targetPort": app.port,
                    "protocol": "TCP"
                }]
            }
        }
    }


    values_yaml = yaml.safe_dump(values, sort_keys=False)

    deployment = Deployment.objects.create(
        app=app,
        status='in-progress',
        helm_values=values_yaml,
        logs='',
        error_messages=''
    )

    def run_helm(deployment_id):
        deployment_obj = Deployment.objects.get(id=deployment_id)

        with tempfile.NamedTemporaryFile(mode="w+", suffix=".yaml", delete=False) as f:
            f.write(values_yaml)
            yaml_file_path = f.name

        cmd = f"helm upgrade --install {app.name} {settings.NIXYS_CHART_PATH} --namespace {app.namespace} -f {yaml_file_path}"

        try:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=True)
            deployment_obj.logs = result.stdout

            v1 = get_k8s_client()
            for _ in range(30):
                pods = v1.list_namespaced_pod(namespace=app.namespace, label_selector=f"app.kubernetes.io/instance={app.name}")
                if pods.items:
                    all_ready = True
                    for pod in pods.items:
                        container_statuses = pod.status.container_statuses or []
                        if pod.status.phase != "Running" or not all(cs.ready for cs in container_statuses):
                            all_ready = False
                            break

                    if all_ready:
                        deployment_obj.status = 'success'
                        deployment_obj.error_messages = ""
                        break
                    else:
                        deployment_obj.status = 'in-progress'
                else:
                    deployment_obj.status = 'in-progress'

                time.sleep(2)
            else:
                deployment_obj.status = 'failed'
                deployment_obj.error_messages = "Pods did not become ready after deployment attempt."

        except subprocess.CalledProcessError as e:
            deployment_obj.status = 'failed'
            deployment_obj.logs = e.stdout
            deployment_obj.error_messages = e.stderr or "Helm command failed"

        deployment_obj.save()

    threading.Thread(target=run_helm, args=(deployment.id,), daemon=True).start()

    return deployment
