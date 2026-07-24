from rest_framework import permissions, views
from rest_framework.response import Response
from accounts.models import User
from students.models import StudentProfile
from teachers.models import TeacherProfile
from attendance.models import AttendanceRecord
from leave_management.models import LeaveRequest
from django.utils import timezone
import os
import google.generativeai as genai
from django.core.cache import cache
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

class DailyAIReportView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        today = timezone.localtime().date()
        
        cache_key = f"ai_report_{user.role}_{user.id}_{today}"
        cached_report = cache.get(cache_key)
        
        if cached_report:
            return Response({"report": cached_report})
            
        api_key = os.environ.get('GEMINI_API_KEY')
        if not api_key:
            return Response({"report": "AI Insights are currently unavailable. Please configure the GEMINI_API_KEY."})
            
        genai.configure(api_key=api_key)
        # Handle new and old models gracefully
        try:
            model = genai.GenerativeModel('gemini-flash-latest')
        except Exception:
            model = genai.GenerativeModel('gemini-1.5-flash')
        
        stats_text = ""
        if user.role == 'Admin':
            total_students = StudentProfile.objects.count()
            total_teachers = TeacherProfile.objects.count()
            present_today = AttendanceRecord.objects.filter(date=today, status='Present').count()
            absent_today = AttendanceRecord.objects.filter(date=today, status='Absent').count()
            pending_leaves = LeaveRequest.objects.filter(status='Pending').count()
            
            stats_text = f"Total Students: {total_students}, Total Teachers: {total_teachers}. Today: {present_today} present, {absent_today} absent. Pending Leaves: {pending_leaves}."
            prompt = f"You are an AI assistant for a school administrator. Based on the following attendance stats for today, write a concise, professional 2-paragraph executive summary highlighting any trends or concerns. Do not use formatting like markdown bolding or headers. Stats: {stats_text}"
            
        elif user.role == 'Teacher':
            teacher = user.teacher_profile
            total_students = StudentProfile.objects.filter(section__assigned_teachers=teacher).count()
            present_today = AttendanceRecord.objects.filter(date=today, status='Present', student__section__assigned_teachers=teacher).count()
            absent_today = AttendanceRecord.objects.filter(date=today, status='Absent', student__section__assigned_teachers=teacher).count()
            
            stats_text = f"Total Assigned Students: {total_students}. Today: {present_today} present, {absent_today} absent."
            prompt = f"You are an AI assistant for a school teacher. Based on the following attendance stats for their class today, write a concise, encouraging 1-paragraph summary highlighting the attendance status. Do not use formatting like markdown bolding or headers. Stats: {stats_text}"
        else:
            return Response({"error": "AI report not available for this role."}, status=403)
            
        try:
            response = model.generate_content(prompt)
            report = response.text
            cache.set(cache_key, report, timeout=3600 * 4) # Cache for 4 hours
            return Response({"report": report})
        except Exception as e:
            return Response({"report": f"Failed to generate AI report: {str(e)}"})
