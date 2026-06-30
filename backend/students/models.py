import uuid
from django.db import models
from accounts.models import User
from common.models import Section
from teachers.models import TeacherProfile

class StudentProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    enrollment_number = models.CharField(max_length=50, unique=True)
    section = models.ForeignKey(Section, on_delete=models.SET_NULL, null=True, related_name='students')
    batch_year = models.IntegerField(null=True, blank=True)
    
    # A student can have a primary mentor or assigned teacher
    assigned_teacher = models.ForeignKey(TeacherProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='mentored_students')
    
    # QR Code data (the secure random token generated)
    qr_token = models.CharField(max_length=255, blank=True, null=True)
    qr_token_expires = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Student: {self.user.username} ({self.enrollment_number})"
