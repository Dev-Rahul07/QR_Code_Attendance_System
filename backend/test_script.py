import os
import django
import sys
import traceback

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from reports.views import ExportAttendanceView
from django.test import RequestFactory

User = get_user_model()
admin = User.objects.filter(role='Admin').first()
factory = RequestFactory()
request = factory.get('/api/reports/export-attendance/?format=csv')
request.user = admin
request.query_params = request.GET

view = ExportAttendanceView()
view.request = request
view.format_kwarg = None

try:
    print("Calling GET...")
    response = view.get(request)
    print("Success!", response)
except Exception as e:
    print("ERROR CAUGHT:")
    print(traceback.format_exc())
