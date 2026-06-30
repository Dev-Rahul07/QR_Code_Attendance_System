from rest_framework import serializers
from .models import LeaveRequest

class LeaveRequestSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)
    
    class Meta:
        model = LeaveRequest
        fields = '__all__'
        read_only_fields = ['id', 'status', 'teacher_remarks', 'created_at', 'updated_at']

class LeaveApprovalSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['Approved', 'Rejected'])
    teacher_remarks = serializers.CharField(required=False, allow_blank=True)
