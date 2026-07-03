from rest_framework import serializers
from .models import TeacherProfile

class TeacherProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.get_full_name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True, default='Unassigned')

    class Meta:
        model = TeacherProfile
        fields = ['id', 'employee_id', 'designation', 'name', 'department_name']
