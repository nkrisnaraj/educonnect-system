from django.shortcuts import render, redirect

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .serializers import UserSerializer, RegisterSerializer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication 
from datetime import datetime
from datetime import datetime
import requests
from django.conf import settings
from edu_admin.zoom_api import ZoomAPIClient
import logging
from urllib.parse import urlencode
import uuid

User = get_user_model()

logger = logging.getLogger(__name__)

def _get_default_zoom_account_key():
    accounts = getattr(settings, "ZOOM_ACCOUNTS", {})
    if not accounts:
        return None
    return next(iter(accounts.keys()))


def has_zoom_account_for_email(email: str) -> bool:
    """
    Return True if Zoom user exists for the given email using the default Zoom account.
    """
    account_key = _get_default_zoom_account_key()
    if not account_key:
        logger.warning("No ZOOM_ACCOUNTS configured in settings.")
        return False

    try:
        client = ZoomAPIClient(account_key)
        token = client.get_access_token()
    except Exception as e:
        logger.exception("Failed to get Zoom access token: %s", e)
        return False

    url = f"https://api.zoom.us/v2/users/{email}"
    headers = {"Authorization": f"Bearer {token}"}
    try:
        resp = requests.get(url, headers=headers, timeout=6)
    except requests.RequestException as e:
        logger.exception("Zoom users API request failed: %s", e)
        return False

    if resp.status_code == 200:
        return True
    if resp.status_code == 404:
        return False

    logger.warning("Unexpected Zoom API status %s for %s: %s", resp.status_code, email, resp.text[:200])
    return False

class StudentDetailView(RetrieveAPIView):
    
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    serializer_class = UserSerializer

    def get_object(self):
        print("User in request:", self.request.user)
        print("Is authenticated:", self.request.user.is_authenticated)
        user = self.request.user
        if not hasattr(user, 'student_profile'):
            raise PermissionDenied("Student profile not found.")
        return user

def validate_nic(nic_no):
    if len(nic_no) != 12 or not nic_no.isdigit():
        return "NIC must be exactly 12 numeric characters (modern format)."

    try:
        birth_year = int(nic_no[:4])
    except ValueError:
        return "NIC format is invalid. Birth year could not be parsed."

    current_year = datetime.now().year
    age = current_year - birth_year

    if age not in [16, 17, 18, 19,20, 21, 22, 23]:
        return "Only students aged 19 to 22 can register."

    return None  # No error

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


# @api_view(['POST'])
# def register_user(request):
#     nic_no = request.data.get('student_profile', {}).get('nic_no')
#     if nic_no:
#         nic_error = validate_nic(nic_no)
#         if nic_error:
#             return Response({"error": nic_error}, status=status.HTTP_400_BAD_REQUEST)

#     serializer = RegisterSerializer(data=request.data)
#     if serializer.is_valid():
#         user = serializer.save()
#         return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def zoom_login(request):
    """Initiate Zoom OAuth login"""
    # Generate a state parameter for security
    state = str(uuid.uuid4())
    request.session['zoom_oauth_state'] = state
    
    params = {
        'response_type': 'code',
        'client_id': getattr(settings, 'ZOOM_CLIENT_ID', ''),
        'redirect_uri': getattr(settings, 'ZOOM_REDIRECT_URI', 'http://127.0.0.1:8000/api/accounts/zoom/callback/'),
        'state': state,
        'scope': 'user:read'
    }
    
    zoom_auth_url = f"https://zoom.us/oauth/authorize?{urlencode(params)}"
    return Response({'auth_url': zoom_auth_url}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def zoom_callback(request):
    """Handle Zoom OAuth callback"""
    code = request.GET.get('code')
    state = request.GET.get('state')
    error = request.GET.get('error')
    
    if error:
        return Response({'error': f'Zoom OAuth error: {error}'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not code:
        return Response({'error': 'Authorization code not provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Verify state parameter
    session_state = request.session.get('zoom_oauth_state')
    if not session_state or session_state != state:
        return Response({'error': 'Invalid state parameter'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Exchange code for access token
        token_data = get_zoom_access_token(code)
        access_token = token_data.get('access_token')
        
        if not access_token:
            return Response({'error': 'Failed to get access token'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get user info from Zoom
        user_info = get_zoom_user_info(access_token)
        zoom_email = user_info.get('email')
        
        if not zoom_email:
            return Response({'error': 'Failed to get user email from Zoom'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify it's a Gmail address
        if not zoom_email.lower().endswith('@gmail.com'):
            return Response({
                'error': 'Only Gmail addresses are allowed for student registration'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Store verified email in session for registration
        request.session['verified_zoom_email'] = zoom_email
        
        return Response({
            'success': True,
            'email': zoom_email,
            'message': 'Zoom verification successful. You can now complete registration.'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.exception("Zoom OAuth callback error: %s", e)
        return Response({'error': 'Zoom authentication failed'}, status=status.HTTP_400_BAD_REQUEST)

def get_zoom_access_token(code):
    """Exchange authorization code for access token"""
    token_url = "https://zoom.us/oauth/token"
    
    data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': getattr(settings, 'ZOOM_REDIRECT_URI', 'http://127.0.0.1:8000/api/accounts/zoom/callback/'),
    }
    
    response = requests.post(
        token_url,
        data=data,
        auth=(getattr(settings, 'ZOOM_CLIENT_ID', ''), getattr(settings, 'ZOOM_CLIENT_SECRET', '')),
        timeout=10
    )
    
    response.raise_for_status()
    return response.json()

def get_zoom_user_info(access_token):
    """Get user information from Zoom API"""
    user_url = "https://api.zoom.us/v2/users/me"
    headers = {'Authorization': f'Bearer {access_token}'}
    
    response = requests.get(user_url, headers=headers, timeout=10)
    response.raise_for_status()
    return response.json()

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    nic_no = request.data.get('student_profile', {}).get('nic_no')
    if nic_no:
        nic_error = validate_nic(nic_no)
        if nic_error:
            return Response({"error": nic_error}, status=status.HTTP_400_BAD_REQUEST)

    # Zoom verification temporarily disabled for development
    # if request.data.get('student_profile'):
    #     email = request.data.get('email') or request.data.get('username')
        
    #     # Verify it's a Gmail address
    #     if not email.lower().endswith('@gmail.com'):
    #         return Response({
    #             'error': 'Students must register with a valid Gmail address.'
    #         }, status=status.HTTP_400_BAD_REQUEST)
        
    #     # Check if user has Zoom account (using existing function)
    #     if not has_zoom_account_for_email(email):
    #         return Response({
    #             'error': f'No Zoom account found for {email}. Please ensure you have a Zoom account registered with this Gmail address.',
    #             'zoom_verification_required': True
    #         }, status=status.HTTP_400_BAD_REQUEST)
        
    #     # Check if email was verified through Zoom OAuth (if OAuth is working)
    #     verified_email = request.session.get('verified_zoom_email')
    #     if verified_email and email != verified_email:
    #         return Response({
    #             'error': f'Email mismatch. You verified {verified_email} with Zoom, but trying to register with {email}.'
    #         }, status=status.HTTP_400_BAD_REQUEST)

    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Clear the verified email from session after successful registration
        if 'verified_zoom_email' in request.session:
            del request.session['verified_zoom_email']
            
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)

    if user:
        tokens = get_tokens_for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "refresh": tokens['refresh'],
            "access": tokens['access']
        }, status=status.HTTP_200_OK)
    return Response({'error': 'Invalid username or password'}, status=status.HTTP_401_UNAUTHORIZED)


#OTP Send 
from .models import PasswordResetOTP
import random
from django.core.mail import send_mail

@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    email = request.data.get('email')
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'User with this email does not exist'}, status=status.HTTP_404_NOT_FOUND)
    
    otp = str(random.randint(100000, 999999))  
    PasswordResetOTP.objects.create(user=user, otp=otp)

    send_mail(
        subject="Your Password Reset OTP",
        message=f"Your OTP is {otp}. It is valid for 10 minutes.",
         from_email="no-reply@example.com", # settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
    )

    return Response({'message': 'OTP sent successfully','otp':otp}, status=status.HTTP_200_OK)    


# Note: The email backend is set to console for development purposes.

#Verify OTP
from datetime import timedelta
from django.utils import timezone
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    email = request.data.get('email')
    otp = request.data.get('otp')
    print("Email:", email)
    print("OTP:", otp)
    if not email or not otp:
        return Response({"error": "Email and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "User with this email does not exist"}, status=status.HTTP_404_NOT_FOUND)

    otp_record = PasswordResetOTP.objects.filter(user=user, otp=otp).first()
    print("OTP Record:", otp_record)
    if not otp_record:
        return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

    if otp_record.created_at + timedelta(minutes=10) < timezone.now():
        return Response({"error": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"message": "OTP is valid"}, status=status.HTTP_200_OK)


#Reset Password
@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    email = request.data.get('email')
    new_password = request.data.get('newpassword')
    confirm_password = request.data.get('confirmpassword')

    if not all([email, new_password, confirm_password]):
        return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)
    
    if new_password != confirm_password:
        return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "Invalid email"}, status=404)
    
    user.set_password(new_password)
    user.save()

    return Response({"message": "Password reset successfully"}, status=status.HTTP_200_OK)
    