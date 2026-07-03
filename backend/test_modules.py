import os
import django
import traceback

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate
from holiday_management.views import HolidayViewSet
from leave_management.views import LeaveRequestViewSet

User = get_user_model()
admin = User.objects.filter(role='Admin').first()
factory = APIRequestFactory()

def test_holidays():
    print("Testing Holidays GET...")
    request = factory.get('/api/holidays/')
    force_authenticate(request, user=admin)
    view = HolidayViewSet.as_view({'get': 'list'})
    response = view(request)
    print("Holidays GET Status:", response.status_code)

def test_leaves():
    print("Testing Leaves GET...")
    request = factory.get('/api/leaves/')
    force_authenticate(request, user=admin)
    view = LeaveRequestViewSet.as_view({'get': 'list'})
    response = view(request)
    print("Leaves GET Status:", response.status_code)

try:
    test_holidays()
    test_leaves()
except Exception as e:
    print(traceback.format_exc())
