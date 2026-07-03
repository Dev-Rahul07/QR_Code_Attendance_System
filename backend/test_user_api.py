import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate
from accounts.views import UserViewSet

User = get_user_model()
admin = User.objects.filter(role='Admin').first()
student = User.objects.filter(role='Student').first()
factory = APIRequestFactory()

def test_admin_access():
    print("\n--- Testing Admin Access ---")
    request = factory.get('/api/accounts/users/')
    force_authenticate(request, user=admin)
    view = UserViewSet.as_view({'get': 'list'})
    response = view(request)
    print("Admin GET Status:", response.status_code)
    
def test_student_access():
    print("\n--- Testing Student Access ---")
    request = factory.get('/api/accounts/users/')
    force_authenticate(request, user=student)
    view = UserViewSet.as_view({'get': 'list'})
    response = view(request)
    print("Student GET Status:", response.status_code)

try:
    test_admin_access()
    test_student_access()
except Exception as e:
    import traceback
    print(traceback.format_exc())
