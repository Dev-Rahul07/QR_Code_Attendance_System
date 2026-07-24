from rest_framework import permissions, status, views
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, date
from .models import AttendanceRecord
from .serializers import AttendanceRecordSerializer, QRScanSerializer
from students.qr_service import QRService
from teachers.models import TeacherProfile

class ScanQRView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if request.user.role != 'Teacher':
            return Response({"error": "Only teachers can mark attendance via QR."}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            teacher_profile = request.user.teacher_profile
        except TeacherProfile.DoesNotExist:
            return Response({"error": "Teacher profile not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = QRScanSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        qr_data = serializer.validated_data['qr_data']
        is_valid, result = QRService.validate_qr_data(qr_data)
        
        if not is_valid:
            return Response({"error": result}, status=status.HTTP_400_BAD_REQUEST)
            
        student_profile = result
        today = timezone.localtime().date()
        current_time = timezone.localtime().time()
        
        # Check if record exists for today
        record, created = AttendanceRecord.objects.get_or_create(
            student=student_profile,
            date=today,
            defaults={
                'teacher': teacher_profile,
                'check_in': current_time,
                'status': 'Present'
            }
        )
        
        if created:
            # Successfully checked in
            return Response({
                "message": f"Successfully checked in {student_profile.user.get_full_name()}",
                "data": AttendanceRecordSerializer(record).data
            }, status=status.HTTP_200_OK)
        else:
            # Record already exists, maybe check-out
            if not record.check_out:
                # Calculate working hours (approx)
                if record.check_in:
                    dummy_date = date.today()
                    dt_in = datetime.combine(dummy_date, record.check_in)
                    dt_out = datetime.combine(dummy_date, current_time)
                    diff = dt_out - dt_in
                    record.working_hours = diff.total_seconds() / 3600.0
                    
                record.check_out = current_time
                record.save()
                return Response({
                    "message": f"Successfully checked out {student_profile.user.get_full_name()}",
                    "data": AttendanceRecordSerializer(record).data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "error": f"Student {student_profile.user.get_full_name()} has already checked out for today."
                }, status=status.HTTP_400_BAD_REQUEST)

class AttendanceListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        qs = AttendanceRecord.objects.none()
        if user.role == 'Admin':
            qs = AttendanceRecord.objects.all()
        elif user.role == 'Teacher':
            qs = AttendanceRecord.objects.filter(student__section__assigned_teachers=user.teacher_profile)
        elif user.role == 'Student':
            qs = AttendanceRecord.objects.filter(student=user.student_profile)
            
        date_filter = request.query_params.get('date')
        if date_filter:
            qs = qs.filter(date=date_filter)
            
        qs = qs.order_by('-date', '-created_at')
        serializer = AttendanceRecordSerializer(qs, many=True)
        return Response(serializer.data)
