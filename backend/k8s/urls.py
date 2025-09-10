from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AppViewSet, DeploymentViewSet

router = DefaultRouter()
router.register(r'', AppViewSet, basename='app')
router.register(r'deployments', DeploymentViewSet, basename='deployment')

urlpatterns = [
    path('', include(router.urls)),
]