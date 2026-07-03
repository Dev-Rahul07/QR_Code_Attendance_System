from django.urls import path
from .views import TeacherListView

urlpatterns = [
    path('', TeacherListView.as_view(), name='teacher_list'),
]
