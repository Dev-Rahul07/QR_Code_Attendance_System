import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from students.models import StudentProfile
from teachers.models import TeacherProfile

# Fix missing Student profiles
students = User.objects.filter(role='Student', student_profile__isnull=True)
count = 0
for s in students:
    enrollment_num = f"STU-{s.username.upper()}"
    StudentProfile.objects.create(user=s, enrollment_number=enrollment_num)
    count += 1
print(f"Created {count} missing Student profiles.")

# Fix missing Teacher profiles
teachers = User.objects.filter(role='Teacher', teacher_profile__isnull=True)
count = 0
for t in teachers:
    emp_id = f"EMP-{t.username.upper()}"
    TeacherProfile.objects.create(user=t, employee_id=emp_id)
    count += 1
print(f"Created {count} missing Teacher profiles.")
