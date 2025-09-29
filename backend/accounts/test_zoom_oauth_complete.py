"""
Comprehensive Test Suite for Zoom OAuth Registration System
Run with: python manage.py test accounts.test_zoom_oauth_complete
"""
from django.test import TestCase, override_settings
from rest_framework.test import APIRequestFactory, APIClient
from rest_framework import status
from unittest.mock import patch, Mock
from django.contrib.sessions.middleware import SessionMiddleware
from django.contrib.auth import get_user_model

from accounts.views import (
    zoom_login, 
    zoom_callback, 
    register_user,
    get_zoom_access_token,
    get_zoom_user_info
)

User = get_user_model()


class ZoomOAuthTestCase(TestCase):
    """Base test case with common setup for Zoom OAuth tests"""
    
    def setUp(self):
        self.factory = APIRequestFactory()
        self.client = APIClient()
        
        # Common test data
        self.valid_student_data = {
            'username': 'teststudent',
            'first_name': 'Test',
            'last_name': 'Student',
            'email': 'student@gmail.com',
            'password': 'password123',
            'student_profile': {
                'nic_no': '200601010000',
                'mobile': '0771234567',
                'address': 'Test Address',
                'year_of_al': '2023',
                'school_name': 'Test School',
                'city': 'Colombo',
                'district': 'Colombo'
            }
        }
        
        self.non_gmail_data = {
            'username': 'testuser',
            'first_name': 'Test',
            'last_name': 'User',
            'email': 'test@yahoo.com',
            'password': 'password123',
            'student_profile': {
                'nic_no': '200601010001',
                'mobile': '0771234568',
                'address': 'Test Address',
                'year_of_al': '2023',
                'school_name': 'Test School'
            }
        }

    def add_session_to_request(self, request):
        """Add session support to request"""
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request)
        request.session.save()
        return request


@override_settings(
    ZOOM_CLIENT_ID='test_client_id',
    ZOOM_CLIENT_SECRET='test_client_secret',
    ZOOM_REDIRECT_URI='http://localhost:8000/api/auth/zoom/callback/'
)
class ZoomLoginViewTests(ZoomOAuthTestCase):
    """Test Zoom OAuth login initiation"""
    
    def test_zoom_login_generates_auth_url(self):
        """Test that zoom_login generates correct Zoom OAuth URL"""
        request = self.factory.get('/api/auth/zoom/login/')
        request = self.add_session_to_request(request)
        
        response = zoom_login(request)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('auth_url', response.data)
        
        auth_url = response.data['auth_url']
        self.assertTrue(auth_url.startswith('https://zoom.us/oauth/authorize'))
        self.assertIn('test_client_id', auth_url)
        self.assertIn('http://localhost:8000/api/auth/zoom/callback/', auth_url)
        self.assertIn('user:read', auth_url)
        
        # Check that state was set in session
        self.assertIn('zoom_oauth_state', request.session)
        state = request.session['zoom_oauth_state']
        self.assertIn(f'state={state}', auth_url)

    def test_zoom_login_different_settings(self):
        """Test zoom_login with different configuration"""
        with override_settings(
            ZOOM_CLIENT_ID='different_client',
            ZOOM_REDIRECT_URI='https://example.com/callback/'
        ):
            request = self.factory.get('/api/auth/zoom/login/')
            request = self.add_session_to_request(request)
            
            response = zoom_login(request)
            
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            auth_url = response.data['auth_url']
            self.assertIn('different_client', auth_url)
            self.assertIn('https://example.com/callback/', auth_url)


class ZoomCallbackViewTests(ZoomOAuthTestCase):
    """Test Zoom OAuth callback handling"""
    
    def test_zoom_callback_missing_code(self):
        """Test callback without authorization code"""
        request = self.factory.get('/api/auth/zoom/callback/')
        request = self.add_session_to_request(request)
        
        response = zoom_callback(request)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Authorization code not provided', response.data['error'])

    def test_zoom_callback_with_error(self):
        """Test callback with OAuth error"""
        request = self.factory.get('/api/auth/zoom/callback/?error=access_denied')
        request = self.add_session_to_request(request)
        
        response = zoom_callback(request)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('access_denied', response.data['error'])

    def test_zoom_callback_invalid_state(self):
        """Test callback with invalid state parameter"""
        request = self.factory.get('/api/auth/zoom/callback/?code=test_code&state=invalid_state')
        request = self.add_session_to_request(request)
        request.session['zoom_oauth_state'] = 'valid_state'
        
        response = zoom_callback(request)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Invalid state parameter', response.data['error'])

    @patch('accounts.views.get_zoom_user_info')
    @patch('accounts.views.get_zoom_access_token')
    def test_zoom_callback_success_gmail(self, mock_get_token, mock_get_user_info):
        """Test successful callback with Gmail address"""
        mock_get_token.return_value = {'access_token': 'fake_token'}
        mock_get_user_info.return_value = {'email': 'student@gmail.com'}
        
        request = self.factory.get('/api/auth/zoom/callback/?code=test_code&state=test_state')
        request = self.add_session_to_request(request)
        request.session['zoom_oauth_state'] = 'test_state'
        
        response = zoom_callback(request)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['email'], 'student@gmail.com')
        self.assertEqual(request.session['verified_zoom_email'], 'student@gmail.com')

    @patch('accounts.views.get_zoom_user_info')
    @patch('accounts.views.get_zoom_access_token')
    def test_zoom_callback_non_gmail_rejected(self, mock_get_token, mock_get_user_info):
        """Test callback rejects non-Gmail addresses"""
        mock_get_token.return_value = {'access_token': 'fake_token'}
        mock_get_user_info.return_value = {'email': 'student@yahoo.com'}
        
        request = self.factory.get('/api/auth/zoom/callback/?code=test_code&state=test_state')
        request = self.add_session_to_request(request)
        request.session['zoom_oauth_state'] = 'test_state'
        
        response = zoom_callback(request)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Only Gmail addresses are allowed', response.data['error'])

    @patch('accounts.views.get_zoom_user_info')
    @patch('accounts.views.get_zoom_access_token')
    def test_zoom_callback_token_failure(self, mock_get_token, mock_get_user_info):
        """Test callback when token exchange fails"""
        mock_get_token.return_value = {}  # No access_token
        
        request = self.factory.get('/api/auth/zoom/callback/?code=test_code&state=test_state')
        request = self.add_session_to_request(request)
        request.session['zoom_oauth_state'] = 'test_state'
        
        response = zoom_callback(request)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Failed to get access token', response.data['error'])


class RegistrationWithZoomTests(ZoomOAuthTestCase):
    """Test registration with Zoom OAuth verification"""
    
    def test_registration_without_zoom_verification(self):
        """Test that student registration requires Zoom verification"""
        request = self.factory.post('/api/auth/register/', self.valid_student_data, format='json')
        request = self.add_session_to_request(request)
        
        response = register_user(request)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('must verify their Zoom account', response.data['error'])
        self.assertTrue(response.data.get('zoom_verification_required'))

    def test_registration_non_gmail_rejected(self):
        """Test that non-Gmail addresses are rejected for students"""
        request = self.factory.post('/api/auth/register/', self.non_gmail_data, format='json')
        request = self.add_session_to_request(request)
        request.session['verified_zoom_email'] = 'test@yahoo.com'
        
        response = register_user(request)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('must verify their Zoom account', response.data['error'])

    def test_registration_email_mismatch(self):
        """Test registration with mismatched emails"""
        request = self.factory.post('/api/auth/register/', self.valid_student_data, format='json')
        request = self.add_session_to_request(request)
        request.session['verified_zoom_email'] = 'different@gmail.com'
        
        response = register_user(request)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Email mismatch', response.data['error'])

    @patch('accounts.views.UserSerializer')
    @patch('accounts.views.RegisterSerializer')
    def test_registration_with_zoom_verification_success(self, mock_register_serializer, mock_user_serializer):
        """Test successful registration with Zoom verification"""
        # Mock successful serialization
        mock_user = Mock()
        mock_user.email = 'student@gmail.com'
        mock_register_serializer.return_value.is_valid.return_value = True
        mock_register_serializer.return_value.save.return_value = mock_user
        mock_user_serializer.return_value.data = {'email': 'student@gmail.com', 'id': 1}
        
        request = self.factory.post('/api/auth/register/', self.valid_student_data, format='json')
        request = self.add_session_to_request(request)
        request.session['verified_zoom_email'] = 'student@gmail.com'
        
        response = register_user(request)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['email'], 'student@gmail.com')
        
        # Check that verified email was cleared from session
        self.assertNotIn('verified_zoom_email', request.session)

    def test_registration_non_student_allowed(self):
        """Test that non-student registration works without Zoom verification"""
        data = {
            'username': 'instructor',
            'first_name': 'Test',
            'last_name': 'Instructor',
            'email': 'instructor@example.com',
            'password': 'password123'
            # No student_profile
        }
        
        with patch('accounts.views.RegisterSerializer') as mock_serializer, \
             patch('accounts.views.UserSerializer') as mock_user_serializer:
            
            mock_user = Mock()
            mock_user.email = 'instructor@example.com'
            mock_serializer.return_value.is_valid.return_value = True
            mock_serializer.return_value.save.return_value = mock_user
            mock_user_serializer.return_value.data = {'email': 'instructor@example.com'}
            
            request = self.factory.post('/api/auth/register/', data, format='json')
            request = self.add_session_to_request(request)
            
            response = register_user(request)
            
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class ZoomAPIHelperTests(ZoomOAuthTestCase):
    """Test Zoom API helper functions"""
    
    @patch('accounts.views.requests.post')
    def test_get_zoom_access_token_success(self, mock_post):
        """Test successful token exchange"""
        mock_response = Mock()
        mock_response.json.return_value = {'access_token': 'test_token'}
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        result = get_zoom_access_token('test_code')
        
        self.assertEqual(result['access_token'], 'test_token')
        mock_post.assert_called_once()

    @patch('accounts.views.requests.get')
    def test_get_zoom_user_info_success(self, mock_get):
        """Test successful user info retrieval"""
        mock_response = Mock()
        mock_response.json.return_value = {'email': 'user@gmail.com', 'id': '123'}
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        result = get_zoom_user_info('test_token')
        
        self.assertEqual(result['email'], 'user@gmail.com')
        mock_get.assert_called_once_with(
            'https://api.zoom.us/v2/users/me',
            headers={'Authorization': 'Bearer test_token'},
            timeout=10
        )


class IntegrationTests(ZoomOAuthTestCase):
    """End-to-end integration tests"""
    
    @patch('accounts.views.get_zoom_user_info')
    @patch('accounts.views.get_zoom_access_token')
    @patch('accounts.views.UserSerializer')
    @patch('accounts.views.RegisterSerializer')
    def test_complete_zoom_oauth_flow(self, mock_register_serializer, mock_user_serializer, 
                                    mock_get_token, mock_get_user_info):
        """Test complete OAuth flow from login to registration"""
        
        # Step 1: Get Zoom login URL
        login_request = self.factory.get('/api/auth/zoom/login/')
        login_request = self.add_session_to_request(login_request)
        
        login_response = zoom_login(login_request)
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn('auth_url', login_response.data)
        
        # Step 2: Handle OAuth callback
        mock_get_token.return_value = {'access_token': 'fake_token'}
        mock_get_user_info.return_value = {'email': 'student@gmail.com'}
        
        state = login_request.session['zoom_oauth_state']
        callback_request = self.factory.get(f'/api/auth/zoom/callback/?code=test_code&state={state}')
        callback_request.session = login_request.session
        
        callback_response = zoom_callback(callback_request)
        self.assertEqual(callback_response.status_code, status.HTTP_200_OK)
        self.assertTrue(callback_response.data['success'])
        
        # Step 3: Complete registration
        mock_user = Mock()
        mock_user.email = 'student@gmail.com'
        mock_register_serializer.return_value.is_valid.return_value = True
        mock_register_serializer.return_value.save.return_value = mock_user
        mock_user_serializer.return_value.data = {'email': 'student@gmail.com', 'id': 1}
        
        register_request = self.factory.post('/api/auth/register/', self.valid_student_data, format='json')
        register_request.session = callback_request.session
        
        register_response = register_user(register_request)
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(register_response.data['email'], 'student@gmail.com')


class EdgeCaseTests(ZoomOAuthTestCase):
    """Test edge cases and error handling"""
    
    def test_registration_with_invalid_nic(self):
        """Test registration with invalid NIC number"""
        invalid_data = self.valid_student_data.copy()
        invalid_data['student_profile']['nic_no'] = 'invalid'
        
        request = self.factory.post('/api/auth/register/', invalid_data, format='json')
        request = self.add_session_to_request(request)
        request.session['verified_zoom_email'] = 'student@gmail.com'
        
        response = register_user(request)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('NIC must be exactly 12 numeric characters', response.data['error'])

    @patch('accounts.views.get_zoom_user_info')
    @patch('accounts.views.get_zoom_access_token')
    def test_zoom_callback_api_exception(self, mock_get_token, mock_get_user_info):
        """Test callback when external API calls fail"""
        mock_get_token.side_effect = Exception('API Error')
        
        request = self.factory.get('/api/auth/zoom/callback/?code=test_code&state=test_state')
        request = self.add_session_to_request(request)
        request.session['zoom_oauth_state'] = 'test_state'
        
        response = zoom_callback(request)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Zoom authentication failed', response.data['error'])

    def test_session_handling_edge_cases(self):
        """Test various session edge cases"""
        # Test with no session
        request = self.factory.get('/api/auth/zoom/callback/?code=test&state=test')
        # Don't add session middleware
        
        response = zoom_callback(request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


if __name__ == '__main__':
    import django
    import os
    import sys
    
    # Setup Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    django.setup()
    
    # Run tests
    from django.test.utils import get_runner
    from django.conf import settings
    
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2)
    failures = test_runner.run_tests(['accounts.test_zoom_oauth_complete'])
    
    if failures:
        sys.exit(1)
