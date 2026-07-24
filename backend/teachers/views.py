from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import TeacherProfile
from .serializers import TeacherProfileSerializer

class TeacherListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        queryset = TeacherProfile.objects.all().select_related('user', 'department').order_by('user__first_name')
        serializer = TeacherProfileSerializer(queryset, many=True)
        return Response(serializer.data)
