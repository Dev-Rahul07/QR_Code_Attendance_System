from rest_framework import generics, permissions
from .models import TeacherProfile
from .serializers import TeacherProfileSerializer

class TeacherListView(generics.ListAPIView):
    queryset = TeacherProfile.objects.all().select_related('user', 'department').order_by('user__first_name')
    serializer_class = TeacherProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
