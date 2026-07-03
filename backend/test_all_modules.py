import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate
from holiday_management.views import HolidayViewSet
from leave_management.views import LeaveRequestViewSet
from students.models import StudentProfile
from teachers.models import TeacherProfile
import json

User = get_user_model()
admin = User.objects.filter(role='Admin').first()
student_user = User.objects.filter(role='Student').first()
teacher_user = User.objects.filter(role='Teacher').first()
factory = APIRequestFactory()

def test_holidays():
    print("\n--- Testing Holidays ---")
    request = factory.post('/api/holidays/', {'name': 'Summer Break', 'date': '2026-07-15', 'holiday_type': 'Public Holiday', 'description': 'Break'})
    force_authenticate(request, user=admin)
    view = HolidayViewSet.as_view({'post': 'create'})
    response = view(request)
    print("Holiday POST Status:", response.status_code)
    
def test_leaves():
    print("\n--- Testing Leaves ---")
    if not student_user or not teacher_user:
        print("Missing student or teacher users")
        return
        
    request = factory.post('/api/leaves/', {'leave_type': 'Sick Leave', 'reason': 'Fever', 'start_date': '2026-07-05', 'end_date': '2026-07-06'})
    force_authenticate(request, user=student_user)
    view = LeaveRequestViewSet.as_view({'post': 'create'})
    response = view(request)
    print("Leave POST Status (Student):", response.status_code)
    if response.status_code != 201:
        print("Leave POST Error Data:", getattr(response, 'data', 'No data'))
    
    if response.status_code == 201:
        leave_id = response.data['id']
        request = factory.post(f'/api/leaves/{leave_id}/approve_reject/', {'status': 'Approved', 'teacher_remarks': 'Take care'})
        force_authenticate(request, user=teacher_user)
        view = LeaveRequestViewSet.as_view({'post': 'approve_reject'})
        response = view(request, pk=leave_id)
        print("Leave APPROVE Status (Teacher):", response.status_code)

try:
    test_holidays()
    test_leaves()
except Exception as e:
    import traceback
    print(traceback.format_exc())
