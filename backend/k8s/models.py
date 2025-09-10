from django.db import models


class App(models.Model):
    name = models.CharField(max_length=255)
    namespace = models.CharField(max_length=255, default='default')
    image = models.CharField(max_length=500)
    replicas = models.IntegerField(default=1)
    port = models.IntegerField()
    environment_variables = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Deployment(models.Model):
    STATUS_CHOICES = [
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('in-progress', 'In Progress'),
    ]

    app = models.ForeignKey(App, related_name='deployments', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in-progress')
    helm_values = models.JSONField(default=dict)
    logs = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.app.name} - {self.status} ({self.created_at.strftime('%Y-%m-%d %H:%M:%S')})"
