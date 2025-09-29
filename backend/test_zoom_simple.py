#!/usr/bin/env python
"""
Test Zoom OAuth functionality using Django shell
"""

def test_zoom_oauth():
    """Test our Zoom OAuth implementation"""
    from accounts.views import zoom_login, zoom_callback, register_user
    from rest_framework.test import APIRequestFactory
    from unittest.mock import Mock, patch
    
    factory = APIRequestFactory()
    
    print("🔍 Testing Zoom OAuth Implementation")
    print("=" * 50)
    
    # Test 1: zoom_login view
    print("\n1. Testing zoom_login view...")
    request = factory.get('/api/auth/zoom/login/')
    request.session = {}
    
    try:
        response = zoom_login(request)
        
        if response.status_code == 200 and 'auth_url' in response.data:
            print("   ✅ zoom_login works correctly!")
            print(f"   📋 Auth URL generated successfully")
            auth_url = response.data['auth_url']
            if 'zoom.us/oauth/authorize' in auth_url:
                print("   ✅ Correct Zoom OAuth URL format")
        else:
            print("   ❌ zoom_login failed")
            print(f"   📋 Response: {response.data}")
    except Exception as e:
        print(f"   ❌ Error in zoom_login: {e}")
    
    # Test 2: zoom_callback view (mocked)
    print("\n2. Testing zoom_callback view...")
    request = factory.get('/api/auth/zoom/callback/?code=test_code&state=test_state')
    request.session = {'zoom_oauth_state': 'test_state'}
    
    try:
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
    except Exception as e:
        print(f"   ❌ Error in zoom_callback: {e}")
    
    # Test 3: Registration with Zoom verification
    print("\n3. Testing registration with Zoom verification...")
    
    try:
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
    except Exception as e:
        print(f"   ❌ Error in registration test: {e}")
    
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
