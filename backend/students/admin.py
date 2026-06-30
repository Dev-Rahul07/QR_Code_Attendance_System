from django.contrib import admin
from .models import StudentProfile

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'enrollment_number', 'section']
    search_fields = ['user__username', 'enrollment_number']
