from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('contact/', views.contact_page, name='contact_page'),
    path('student-register/', views.student_register, name='student_register'),
    path('teacher-register/', views.teacher_register, name='teacher_register'),
    path('success/', views.success_page, name='success_page'),
    path('teacher-login/', views.teacher_login, name='teacher_login'),
    path('student-login/', views.student_login, name='student_login'),
    path('teacher-dashboard/', views.teacher_dashboard, name='teacher_dashboard'),
    path('qr-scan/', views.qr_scan_page, name='qr_scan_page'),
    path('stop-scan/', views.stop_scan, name='stop_scan'),
    path('export-attendance/', views.export_attendance, name='export_attendance'),
]
