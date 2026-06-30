import uuid
from django.db import models
from accounts.models import User
from common.models import Department, Section

class TeacherProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='teachers')
    employee_id = models.CharField(max_length=50, unique=True)
    designation = models.CharField(max_length=100, blank=True, null=True)
    joined_date = models.DateField(auto_now_add=True)
    
    # Teachers can be assigned to multiple sections
    assigned_sections = models.ManyToManyField(Section, related_name='assigned_teachers', blank=True)

    def __str__(self):
        return f"Teacher: {self.user.username}"
