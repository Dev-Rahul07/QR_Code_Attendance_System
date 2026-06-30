from django.urls import path
from .views import ExportAttendanceView

urlpatterns = [
    path('export-attendance/', ExportAttendanceView.as_view(), name='export_attendance'),
]
