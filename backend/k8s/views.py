from rest_framework import viewsets
from .models import App
from .serializers import AppSerializer


class AppViewSet(viewsets.ModelViewSet):
    queryset = App.objects.all()
    serializer_class = AppSerializer
