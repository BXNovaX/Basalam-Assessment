import subprocess
import yaml

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

    import tempfile
    with tempfile.NamedTemporaryFile(mode="w+", suffix=".yaml", delete=False) as f:
        f.write(values_yaml)
        yaml_file_path = f.name

    cmd = f"helm upgrade --install {app.name} {settings.NIXYS_CHART_PATH} --namespace {app.namespace} -f {yaml_file_path}"

    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=True)
        deployment.status = 'success'
        deployment.logs = result.stdout
    except subprocess.CalledProcessError as e:
        deployment.status = 'failed'
        deployment.logs = e.stderr

    deployment.save()
    return deployment
