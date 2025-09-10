from rest_framework import serializers
from .models import App, Deployment

class DeploymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deployment
        fields = "__all__"
        read_only_fields = ['id', 'created_at', 'status', 'logs']


class AppSerializer(serializers.ModelSerializer):
    deployments = DeploymentSerializer(many=True, read_only=True)

    class Meta:
        model = App
        fields = "__all__"
        read_only_fields = ['id', 'created_at', 'updated_at', 'deployments']
