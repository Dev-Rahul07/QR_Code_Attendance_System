import qrcode
import uuid
import base64
import hmac
import hashlib
from io import BytesIO
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from .models import StudentProfile

class QRService:
    @staticmethod
    def generate_qr_for_student(student_profile):
        # 1. Generate token data
        token = str(uuid.uuid4())
        expiry_time = timezone.now() + timedelta(minutes=5)
        
        # 2. Create a digital signature
        message = f"{student_profile.id}:{token}:{expiry_time.timestamp()}"
        signature = hmac.new(
            settings.SECRET_KEY.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # 3. Save to database
        student_profile.qr_token = token
        student_profile.qr_token_expires = expiry_time
        student_profile.save()
        
        # 4. Construct payload to be embedded in the QR code
        qr_data = f"{student_profile.id}|{token}|{expiry_time.timestamp()}|{signature}"
        
        # 5. Generate QR Code image
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        # 6. Convert to base64
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        return {
            "qr_image": f"data:image/png;base64,{img_str}",
            "expires_at": expiry_time,
        }

    @staticmethod
    def validate_qr_data(qr_data):
        try:
            student_id, token, timestamp, signature = qr_data.split('|')
            
            # Verify signature
            message = f"{student_id}:{token}:{timestamp}"
            expected_signature = hmac.new(
                settings.SECRET_KEY.encode(),
                message.encode(),
                hashlib.sha256
            ).hexdigest()
            
            if not hmac.compare_digest(signature, expected_signature):
                return False, "Invalid signature"
                
            # Check expiry
            student_profile = StudentProfile.objects.select_related('user').get(id=student_id)
            if timezone.now() > student_profile.qr_token_expires:
                return False, "QR Code expired"
                
            if student_profile.qr_token != token:
                return False, "QR Code reused or invalid"
                
            return True, student_profile
        except Exception as e:
            return False, str(e)
