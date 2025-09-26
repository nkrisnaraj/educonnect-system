#!/usr/bin/env python
"""
Simple test script to verify Zoom OAuth implementation works
"""
import os
import sys
import django
from unittest.mock import Mock, patch
from rest_framework.test import APIRequestFactory
from rest_framework.response import Response

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configure Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.views import zoom_login, zoom_callback, register_user

def test_zoom_oauth():
    """Test our Zoom OAuth implementation"""
    factory = APIRequestFactory()
    
    print("🔍 Testing Zoom OAuth Implementation")
    print("=" * 50)
    
    # Test 1: zoom_login view
    print("\n1. Testing zoom_login view...")
    request = factory.get('/api/auth/zoom/login/')
    request.session = {}
    
    # Mock settings for testing
    with patch('django.conf.settings.ZOOM_CLIENT_ID', 'test_client_id'), \
         patch('django.conf.settings.ZOOM_REDIRECT_URI', 'http://localhost:8000/api/auth/zoom/callback/'):
        
        response = zoom_login(request)
        
        if response.status_code == 200 and 'auth_url' in response.data:
            print("   ✅ zoom_login works correctly!")
            print(f"   📋 Auth URL generated: {response.data['auth_url'][:50]}...")
        else:
            print("   ❌ zoom_login failed")
            print(f"   📋 Response: {response.data}")
    
    # Test 2: zoom_callback view (mocked)
    print("\n2. Testing zoom_callback view...")
    request = factory.get('/api/auth/zoom/callback/?code=test_code&state=test_state')
    request.session = {'zoom_oauth_state': 'test_state'}
    
    # Mock the token exchange and user info functions
    with patch('accounts.views.get_zoom_access_token') as mock_token, \
         patch('accounts.views.get_zoom_user_info') as mock_user_info:
        
        mock_token.return_value = {'access_token': 'fake_token'}
        mock_user_info.return_value = {'email': 'student@gmail.com'}
        
        response = zoom_callback(request)
        
        if response.status_code == 200 and response.data.get('success'):
            print("   ✅ zoom_callback works correctly!")
            print(f"   📋 Verified email: {response.data.get('email')}")
        else:
            print("   ❌ zoom_callback failed")
            print(f"   📋 Response: {response.data}")
    
    # Test 3: Registration with Zoom verification
    print("\n3. Testing registration with Zoom verification...")
    
    # Test without verification (should fail)
    data = {
        "email": "student@gmail.com",
        "password": "pass1234",
        "student_profile": {"nic_no": "200601010000"}
    }
    request = factory.post("/api/auth/register/", data, format="json")
    request.session = {}
    
    response = register_user(request)
    
    if response.status_code == 400 and 'must verify their Zoom account' in response.data.get('error', ''):
        print("   ✅ Registration properly requires Zoom verification!")
    else:
        print("   ❌ Registration should require Zoom verification")
        print(f"   📋 Response: {response.data}")
    
    # Test with verification (should work with mocked serializer)
    print("\n4. Testing registration with Zoom verification (mocked)...")
    request.session = {'verified_zoom_email': 'student@gmail.com'}
    
    with patch('accounts.views.RegisterSerializer') as mock_serializer, \
         patch('accounts.views.UserSerializer') as mock_user_serializer:
        
        # Mock successful serializer
        mock_instance = Mock()
        mock_instance.is_valid.return_value = True
        mock_instance.save.return_value = Mock(email='student@gmail.com')
        mock_serializer.return_value = mock_instance
        
        mock_user_serializer.return_value.data = {'email': 'student@gmail.com'}
        
        response = register_user(request)
        
        if response.status_code == 201:
            print("   ✅ Registration with Zoom verification works!")
        else:
            print("   ❌ Registration with verification failed")
            print(f"   📋 Response: {response.data}")
    
    print("\n" + "=" * 50)
    print("🎉 Zoom OAuth Implementation Test Complete!")
    print("\nKey Features Implemented:")
    print("• Zoom OAuth login URL generation")
    print("• OAuth callback handling with email verification")
    print("• Gmail address validation")
    print("• Session-based verification tracking")
    print("• Registration enforcement for students")

if __name__ == "__main__":
    test_zoom_oauth()
