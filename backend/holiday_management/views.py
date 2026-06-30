from rest_framework import viewsets, permissions
from .models import Holiday
from .serializers import HolidaySerializer

class HolidayViewSet(viewsets.ModelViewSet):
    serializer_class = HolidaySerializer
    queryset = Holiday.objects.all().order_by('date')
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Only admin can create/edit holidays
            # Real RBAC would check if user.role == 'Admin'
            # Let's write a simple custom permission here or inside view
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def check_permissions(self, request):
        super().check_permissions(request)
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            if request.user.role != 'Admin':
                self.permission_denied(request, message="Only admins can manage holidays.")
