import random
from django.core.mail import send_mail
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, OTPVerification
from .serializers import CustomTokenObtainPairSerializer, UserSerializer, ChangePasswordSerializer, AdminUserSerializer, UserCreateSerializer

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        otp = request.data.get("otp")
        
        if not email or not otp:
            return Response({"detail": "Email and OTP are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        otp_verification = OTPVerification.objects.filter(email=email, otp=otp).first()
        if not otp_verification:
            return Response({"detail": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)

        if otp_verification.is_verified:
            return Response({"detail": "OTP already verified."}, status=status.HTTP_400_BAD_REQUEST)
       
        otp_verification.is_verified = True
        otp_verification.save()

        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Create custom JWT token
            refresh = RefreshToken.for_user(user)
            # Add custom claims to match CustomTokenObtainPairSerializer if needed
            refresh['user'] = {
                'id': str(user.id),
                'username': user.username,
                'email': user.email,
                'role': user.role,
            }
            
            response_data = serializer.data
            response_data['refresh'] = str(refresh)
            response_data['access'] = str(refresh.access_token)
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class IsAdminUserRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'Admin')

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    permission_classes = [IsAdminUserRole]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return AdminUserSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data.get("old_password")):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.validated_data.get("new_password"))
            user.save()
            return Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class SendOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        if not email:
            return Response({"detail": "Email is required."},
            status=status.HTTP_400_BAD_REQUEST)
        
        otp = random.randint(100000, 999999)
        OTPVerification.objects.filter(email=email).delete()
        OTPVerification.objects.create(email=email, otp=otp)
        send_mail("OTP Verification", f"Your OTP is {otp}", "pandit07.it@gmail.com", [email], fail_silently=False)
        

        return Response({"detail": "OTP sent successfully."},
        status=status.HTTP_200_OK)
        

        