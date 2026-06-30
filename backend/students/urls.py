from django.urls import path
from .views import MyQRView

urlpatterns = [
    path('my-qr/', MyQRView.as_view(), name='my_qr'),
]
