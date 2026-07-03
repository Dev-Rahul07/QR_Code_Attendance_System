from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'profile_image', 'phone_number', 'is_active']
        read_only_fields = ['id', 'role']

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone_number', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role', 'phone_number']

    def create(self, validated_data):
        password = validated_data.pop('password')
        # Create user instance without saving to hash password
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        # Automatically create the corresponding profile
        if user.role == 'Student':
            from students.models import StudentProfile
            # Generate a fallback enrollment number based on username
            enrollment_num = f"STU-{user.username.upper()}"
            StudentProfile.objects.create(user=user, enrollment_number=enrollment_num)
        elif user.role == 'Teacher':
            from teachers.models import TeacherProfile
            # Generate a fallback employee id based on username
            emp_id = f"EMP-{user.username.upper()}"
            TeacherProfile.objects.create(user=user, employee_id=emp_id)
            
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add custom claims
        data['user'] = {
            'id': str(self.user.id),
            'username': self.user.username,
            'email': self.user.email,
            'role': self.user.role,
        }
        
        # Inactive users should not authenticate.
        # Note: SimpleJWT handles is_active=False by default if we use ModelBackend,
        # but explicit check is good.
        if not self.user.is_active:
            raise serializers.ValidationError("User account is disabled.")
            
        return data

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
