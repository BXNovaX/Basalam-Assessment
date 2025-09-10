from django.core.management.base import BaseCommand
from k8s.models import App
import random


class Command(BaseCommand):
    help = 'Seed the database with 5 sample apps'

    def handle(self, *args, **kwargs):
        sample_env_vars = [
            {'NODE_ENV': 'production', 'API_URL': 'https://api.example.com'},
            {'DATABASE_URL': 'postgres://user:pass@localhost/db', 'REDIS_URL': 'redis://localhost:6379'},
            {'DEBUG': 'false', 'LOG_LEVEL': 'info', 'PORT': '3000'},
            {'AWS_REGION': 'us-east-1', 'S3_BUCKET': 'my-bucket'},
            {'JWT_SECRET': 'secret-key', 'SESSION_TIMEOUT': '3600'},
            {},  # Some apps might have no env vars
        ]
        
        apps_data = [
            {
                'name': f'app-{random.randint(1000, 9999)}',
                'namespace': random.choice(['default', 'production', 'staging', 'development']),
                'image': random.choice([
                    'nginx:latest',
                    'redis:alpine',
                    'postgres:14',
                    'node:18-alpine',
                    'python:3.11-slim',
                    'httpd:2.4',
                    'mysql:8.0',
                    'mongo:6',
                ]),
                'replicas': random.randint(1, 5),
                'port': random.choice([80, 443, 3000, 5000, 8000, 8080, 9000]),
                'environment_variables': random.choice(sample_env_vars),
            }
            for _ in range(5)
        ]

        created_apps = []
        for app_data in apps_data:
            app = App.objects.create(**app_data)
            created_apps.append(app)
            self.stdout.write(
                self.style.SUCCESS(
                    f'Created app: {app.name} in namespace {app.namespace}'
                )
            )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully seeded {len(created_apps)} apps')
        )