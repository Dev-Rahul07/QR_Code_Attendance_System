from django.urls import path
from .views import ScanQRView, AttendanceListView

urlpatterns = [
    path('scan-qr/', ScanQRView.as_view(), name='scan_qr'),
    path('list/', AttendanceListView.as_view(), name='attendance_list'),
]
