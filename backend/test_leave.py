import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from leave_management.models import LeaveRequest
from accounts.models import User
from students.models import StudentProfile
from teachers.models import TeacherProfile

# Get a student and a teacher
student = StudentProfile.objects.first()
teacher = TeacherProfile.objects.first()

if not student or not teacher:
    print("Missing student or teacher")
else:
    print(f"Creating leave for Student: {student.user.username}, assigned to Teacher: {teacher.user.username}")
    leave = LeaveRequest.objects.create(
        student=student,
        teacher=teacher,
        leave_type="Sick Leave",
        reason="Test reason",
        start_date="2026-07-10",
        end_date="2026-07-11"
    )
    print(f"Leave created: {leave.id}")
    
    # Check if teacher can see it
    teacher_leaves = LeaveRequest.objects.filter(teacher=teacher)
    print(f"Teacher {teacher.user.username} has {teacher_leaves.count()} assigned leaves.")
    
    # Check if a DIFFERENT teacher can see it
    other_teacher = TeacherProfile.objects.exclude(id=teacher.id).first()
    if other_teacher:
        other_leaves = LeaveRequest.objects.filter(teacher=other_teacher)
        print(f"Other Teacher {other_teacher.user.username} has {other_leaves.count()} assigned leaves.")
    else:
        print("No other teacher to test isolation.")
