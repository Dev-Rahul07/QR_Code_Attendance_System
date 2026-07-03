import os
import django
from rest_framework.test import APIClient

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from leave_management.models import LeaveRequest
from accounts.models import User
from students.models import StudentProfile
from teachers.models import TeacherProfile

# Get a student and a teacher
student_user = User.objects.filter(role='Student').first()
teacher = TeacherProfile.objects.first()

if not student_user or not teacher:
    print("Missing student or teacher")
else:
    client = APIClient()
    client.force_authenticate(user=student_user)
    
    payload = {
        "leave_type": "Sick Leave",
        "teacher": str(teacher.id),
        "reason": "Test reason from API",
        "start_date": "2026-07-15",
        "end_date": "2026-07-16"
    }
    
    print(f"Sending payload: {payload}")
    response = client.post('/api/leaves/', payload, format='json')
    
    print(f"Status Code: {response.status_code}")
    print(f"Response data: {response.data}")
