import os
import django
import traceback

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework.views import APIView
from reports.views import ExportAttendanceView

original = APIView.handle_exception

def patched_handle_exception(self, exc):
    print('EXCEPTION CAUGHT BY DRF:', type(exc))
    traceback.print_exception(type(exc), exc, exc.__traceback__)
    return original(self, exc)

APIView.handle_exception = patched_handle_exception

User = get_user_model()
admin = User.objects.filter(role='Admin').first()
factory = APIRequestFactory()
request = factory.get('/api/reports/export-attendance/?file_format=csv')
force_authenticate(request, user=admin)
view = ExportAttendanceView.as_view()
response = view(request)
print('STATUS:', response.status_code)
