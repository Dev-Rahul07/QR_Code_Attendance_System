from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('student-register/', views.student_register, name='student_register'),
    path('teacher-register/', views.teacher_register, name='teacher_register'),
    path('success/', views.success_page, name='success_page'),
    path('teacher-login/', views.teacher_login, name='teacher_login'),
    path('dashboard/', views.teacher_dashboard, name='teacher_dashboard'),
    path('student-login/', views.student_login, name='student_login'),
    path('qr-scan/', views.qr_scan_page, name='qr_scan_page'),  # Only one here
    path('export/', views.export_attendance, name='export_attendance'),
    path('contact/', views.contact_page, name='contact_page'),
]
