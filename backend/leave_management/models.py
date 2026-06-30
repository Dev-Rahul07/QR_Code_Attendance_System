import uuid
from django.db import models
from students.models import StudentProfile
from teachers.models import TeacherProfile

class LeaveRequest(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='leave_requests')
    teacher = models.ForeignKey(TeacherProfile, on_delete=models.SET_NULL, null=True, related_name='leave_approvals')
    
    leave_type = models.CharField(max_length=50)
    reason = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    attachment = models.FileField(upload_to='leaves/', blank=True, null=True)
    
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Pending')
    teacher_remarks = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Leave by {self.student.user.username} - {self.status}"
