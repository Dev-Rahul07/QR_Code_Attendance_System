from rest_framework import permissions, views
from rest_framework.response import Response
from accounts.models import User
from students.models import StudentProfile
from teachers.models import TeacherProfile
from attendance.models import AttendanceRecord
from leave_management.models import LeaveRequest
from django.utils import timezone

class DashboardStatsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        today = timezone.localtime().date()
        
        if user.role == 'Admin':
            return Response({
                "total_students": StudentProfile.objects.count(),
                "total_teachers": TeacherProfile.objects.count(),
                "attendance_today": AttendanceRecord.objects.filter(date=today, status='Present').count(),
                "pending_leaves": LeaveRequest.objects.filter(status='Pending').count(),
                "inactive_users": User.objects.filter(is_active=False).count(),
            })
        elif user.role == 'Teacher':
            teacher = user.teacher_profile
            return Response({
                "assigned_students": StudentProfile.objects.filter(section__assigned_teachers=teacher).count(),
                "attendance_today": AttendanceRecord.objects.filter(date=today, status='Present', student__section__assigned_teachers=teacher).count(),
                "pending_leaves": LeaveRequest.objects.filter(status='Pending', teacher=teacher).count(),
            })
        elif user.role == 'Student':
            student = user.student_profile
            total_days = AttendanceRecord.objects.filter(student=student).count()
            present_days = AttendanceRecord.objects.filter(student=student, status='Present').count()
            percentage = (present_days / total_days * 100) if total_days > 0 else 0
            return Response({
                "attendance_percentage": round(percentage, 2),
                "today_status": AttendanceRecord.objects.filter(student=student, date=today).first().status if AttendanceRecord.objects.filter(student=student, date=today).exists() else 'Not Marked',
                "pending_leaves": LeaveRequest.objects.filter(student=student, status='Pending').count(),
            })
        
        return Response({"error": "Invalid role"}, status=400)
