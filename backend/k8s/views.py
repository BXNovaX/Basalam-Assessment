from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import App, Deployment
from .serializers import AppSerializer, DeploymentSerializer
from .services import deploy_app, is_app_running

class AppViewSet(viewsets.ModelViewSet):
    queryset = App.objects.all()
    serializer_class = AppSerializer

    @action(detail=True, methods=['get'])
    def deploy(self, request, pk=None):
        app = self.get_object()
        deployment = deploy_app(app)
        serializer = DeploymentSerializer(deployment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        app = self.get_object()
        running = is_app_running(app)
        return Response({"running": running})

class DeploymentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Deployment.objects.all()
    serializer_class = DeploymentSerializer
