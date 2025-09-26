from django.test import TestCase, override_settings
from rest_framework.test import APIRequestFactory
from unittest.mock import patch, Mock
from accounts.views import register_user, zoom_login, zoom_callback

factory = APIRequestFactory()

@override_settings(
    ZOOM_CLIENT_ID="test_client_id",
    ZOOM_CLIENT_SECRET="test_client_secret",
    ZOOM_REDIRECT_URI="http://localhost:8000/api/auth/zoom/callback/"
)
class ZoomOAuthRegistrationTests(TestCase):
    
    def test_zoom_login_generates_auth_url(self):
        """Test that zoom_login generates correct auth URL"""
        request = factory.get("/api/auth/zoom/login/")
        request.session = {}
        
        response = zoom_login(request)
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('auth_url', response.data)
        self.assertIn('zoom.us/oauth/authorize', response.data['auth_url'])
        self.assertIn('test_client_id', response.data['auth_url'])

    @patch('accounts.views.get_zoom_user_info')
    @patch('accounts.views.get_zoom_access_token')
    def test_zoom_callback_success(self, mock_get_token, mock_get_user_info):
        """Test successful Zoom OAuth callback"""
        # Mock token exchange
        mock_get_token.return_value = {'access_token': 'fake_token'}
        
        # Mock user info
        mock_get_user_info.return_value = {'email': 'student@gmail.com'}
        
        request = factory.get("/api/auth/zoom/callback/?code=test_code&state=test_state")
        request.session = {'zoom_oauth_state': 'test_state'}
        
        response = zoom_callback(request)
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['email'], 'student@gmail.com')
        self.assertEqual(request.session['verified_zoom_email'], 'student@gmail.com')

    @patch('accounts.views.get_zoom_user_info')
    @patch('accounts.views.get_zoom_access_token')
    def test_zoom_callback_non_gmail_rejected(self, mock_get_token, mock_get_user_info):
        """Test that non-Gmail addresses are rejected"""
        mock_get_token.return_value = {'access_token': 'fake_token'}
        mock_get_user_info.return_value = {'email': 'student@yahoo.com'}
        
        request = factory.get("/api/auth/zoom/callback/?code=test_code&state=test_state")
        request.session = {'zoom_oauth_state': 'test_state'}
        
        response = zoom_callback(request)
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('Only Gmail addresses are allowed', response.data['error'])

    @patch('accounts.views.RegisterSerializer')
    @patch('accounts.views.UserSerializer')
    def test_register_with_zoom_verification(self, mock_user_serializer, mock_register_serializer):
        """Test registration with verified Zoom email"""
        # Mock serializers
        dummy_user = Mock()
        dummy_user.email = "student@gmail.com"
        inst = mock_register_serializer.return_value
        inst.is_valid.return_value = True
        inst.save.return_value = dummy_user
        mock_user_serializer.return_value.data = {"email": "student@gmail.com"}
        
        data = {
            "email": "student@gmail.com",
            "password": "pass1234",
            "student_profile": {"nic_no": "200601010000"}
        }
        
        request = factory.post("/api/auth/register/", data, format="json")
        request.session = {'verified_zoom_email': 'student@gmail.com'}
        
        response = register_user(request)
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['email'], "student@gmail.com")

    def test_register_without_zoom_verification_rejected(self):
        """Test that registration without Zoom verification is rejected"""
        data = {
            "email": "student@gmail.com",
            "password": "pass1234",
            "student_profile": {"nic_no": "200601010000"}
        }
        
        request = factory.post("/api/auth/register/", data, format="json")
        request.session = {}
        
        response = register_user(request)
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('must verify their Zoom account', response.data['error'])
        self.assertTrue(response.data.get('zoom_verification_required'))

    @patch('accounts.views.RegisterSerializer')
    @patch('accounts.views.UserSerializer')
    def test_register_email_mismatch_rejected(self, mock_user_serializer, mock_register_serializer):
        """Test that email mismatch is rejected"""
        data = {
            "email": "different@gmail.com",
            "password": "pass1234",
            "student_profile": {"nic_no": "200601010000"}
        }
        
        request = factory.post("/api/auth/register/", data, format="json")
        request.session = {'verified_zoom_email': 'student@gmail.com'}
        
        response = register_user(request)
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('Email mismatch', response.data['error'])
