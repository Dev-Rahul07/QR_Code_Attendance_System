import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from common.models import Department, ClassRoom, Section
from teachers.models import TeacherProfile
from students.models import StudentProfile

def run():
    print("Seeding database...")
    
    # Create Admin
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
        print("Created Admin user: admin / admin123")
    
    # Create Departments & Classes
    dept, _ = Department.objects.get_or_create(name='Computer Science')
    cls, _ = ClassRoom.objects.get_or_create(name='B.Tech CS', department=dept)
    sec, _ = Section.objects.get_or_create(name='A', classroom=cls)
    
    # Create Teacher
    if not User.objects.filter(username='teacher1').exists():
        t_user = User.objects.create_user('teacher1', 'teacher1@example.com', 'teacher123', role='Teacher')
        t_prof = TeacherProfile.objects.create(user=t_user, department=dept, employee_id='T001', designation='Professor')
        t_prof.assigned_sections.add(sec)
        print("Created Teacher user: teacher1 / teacher123")
        
    # Create Student
    if not User.objects.filter(username='student1').exists():
        s_user = User.objects.create_user('student1', 'student1@example.com', 'student123', role='Student')
        s_prof = StudentProfile.objects.create(user=s_user, enrollment_number='S001', section=sec, batch_year=2026)
        print("Created Student user: student1 / student123")
        
    print("Seeding complete.")

if __name__ == '__main__':
    run()
