from rest_framework import permissions, views
from django.http import HttpResponse
from attendance.models import AttendanceRecord
import pandas as pd
from datetime import datetime

class ExportAttendanceView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        format_type = request.query_params.get('file_format', 'csv')
        
        if user.role == 'Admin':
            qs = AttendanceRecord.objects.all().select_related('student__user', 'teacher__user')
        elif user.role == 'Teacher':
            qs = AttendanceRecord.objects.filter(student__section__assigned_teachers=user.teacher_profile).select_related('student__user')
        else:
            return HttpResponse('Unauthorized', status=403)
            
        data = []
        for record in qs:
            data.append({
                'Date': record.date,
                'Student Name': record.student.user.get_full_name(),
                'Enrollment No': record.student.enrollment_number,
                'Check In': record.check_in,
                'Check Out': record.check_out,
                'Status': record.status,
                'Working Hours': record.working_hours,
                'Late Minutes': record.late_minutes
            })
            
        df = pd.DataFrame(data, columns=[
            'Date', 'Student Name', 'Enrollment No', 'Check In', 
            'Check Out', 'Status', 'Working Hours', 'Late Minutes'
        ])
        
        if format_type == 'excel':
            import io
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, index=False)
            
            output.seek(0)
            response = HttpResponse(output.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = f'attachment; filename="attendance_export_{datetime.now().strftime("%Y%m%d%H%M%S")}.xlsx"'
            return response
        else:
            import io
            output = io.StringIO()
            df.to_csv(output, index=False)
            output.seek(0)
            response = HttpResponse(output.getvalue(), content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="attendance_export_{datetime.now().strftime("%Y%m%d%H%M%S")}.csv"'
            return response
