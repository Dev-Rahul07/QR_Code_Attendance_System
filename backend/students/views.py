from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import StudentProfile
from .qr_service import QRService

class MyQRView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.role != 'Student':
            return Response({"error": "Only students can generate QR codes."}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            student_profile = request.user.student_profile
        except StudentProfile.DoesNotExist:
            return Response({"error": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
            
        qr_data = QRService.generate_qr_for_student(student_profile)
        
        return Response(qr_data, status=status.HTTP_200_OK)
