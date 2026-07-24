from django.urls import path
from .views import DashboardStatsView, DailyAIReportView

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('ai-report/', DailyAIReportView.as_view(), name='dashboard_ai_report'),
]
