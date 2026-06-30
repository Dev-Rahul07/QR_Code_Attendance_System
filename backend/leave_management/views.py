from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import LeaveRequest
from .serializers import LeaveRequestSerializer, LeaveApprovalSerializer

class LeaveRequestViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'Student':
            return LeaveRequest.objects.filter(student=user.student_profile).order_by('-created_at')
        elif user.role == 'Teacher':
            return LeaveRequest.objects.filter(teacher=user.teacher_profile).order_by('-created_at')
        elif user.role == 'Admin':
            return LeaveRequest.objects.all().order_by('-created_at')
        return LeaveRequest.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role == 'Student':
            serializer.save(student=self.request.user.student_profile)
        else:
            serializer.save()

    @action(detail=True, methods=['post'])
    def approve_reject(self, request, pk=None):
        if request.user.role != 'Teacher':
            return Response({"error": "Only teachers can approve/reject leaves."}, status=status.HTTP_403_FORBIDDEN)
            
        leave_request = self.get_object()
        serializer = LeaveApprovalSerializer(data=request.data)
        if serializer.is_valid():
            leave_request.status = serializer.validated_data['status']
            if 'teacher_remarks' in serializer.validated_data:
                leave_request.teacher_remarks = serializer.validated_data['teacher_remarks']
            leave_request.save()
            return Response(LeaveRequestSerializer(leave_request).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
