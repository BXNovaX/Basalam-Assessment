import subprocess
import yaml
import time
import tempfile

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
    label_selector = f"app={app.name}"
    pods = v1.list_namespaced_pod(namespace=app.namespace, label_selector=label_selector)
    return any(pod.status.phase == "Running" for pod in pods.items)

def deploy_app(app):
    values = {
        "replicaCount": app.replicas,
        "image": {
            "repository": app.image.split(":")[0],
            "tag": app.image.split(":")[1] if ":" in app.image else "latest"
        },
        "service": {"port": app.port},
        "env": app.environment_variables or {},
    }

    values_yaml = yaml.safe_dump(values, sort_keys=False)

    deployment = Deployment.objects.create(
        app=app,
        status='in-progress',
        helm_values=values_yaml
    )

    with tempfile.NamedTemporaryFile(mode="w+", suffix=".yaml", delete=False) as f:
        f.write(values_yaml)
        yaml_file_path = f.name

    cmd = f"helm upgrade --install {app.name} {settings.NIXYS_CHART_PATH} --namespace {app.namespace} -f {yaml_file_path}"

    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=True)
        deployment.logs = result.stdout

        v1 = get_k8s_client()
        for _ in range(10):
            pods = v1.list_namespaced_pod(namespace=app.namespace, label_selector=f"app={app.name}")
            if pods.items:
                if any(p.status.phase == "Running" for p in pods.items):
                    deployment.status = 'success'
                    deployment.error_messages = ""
                else:
                    deployment.status = 'failed'
                    deployment.error_messages = "\n".join(
                        f"{p.metadata.name}: {p.status.phase}" for p in pods.items
                    )
                break
            time.sleep(1)
        else:
            deployment.status = 'failed'
            deployment.error_messages = "No pods were created after deployment attempt."

    except subprocess.CalledProcessError as e:
        deployment.status = 'failed'
        deployment.logs = e.stdout
        deployment.error_messages = e.stderr or "Helm command failed"

    deployment.save()
    return deployment
