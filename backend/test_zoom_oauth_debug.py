#!/usr/bin/env python
"""
Debug Zoom OAuth Configuration
"""
import os
import django
from urllib.parse import urlencode

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.conf import settings

def test_zoom_oauth_config():
    """Test and display Zoom OAuth configuration"""
    print("🔍 ZOOM OAUTH CONFIGURATION DEBUG")
    print("=" * 50)
    
    # Check environment variables
    print("\n📋 Environment Variables:")
    print(f"ZOOM_CLIENT_ID: {getattr(settings, 'ZOOM_CLIENT_ID', 'NOT SET')}")
    print(f"ZOOM_CLIENT_SECRET: {'*' * len(getattr(settings, 'ZOOM_CLIENT_SECRET', '')) if getattr(settings, 'ZOOM_CLIENT_SECRET', '') else 'NOT SET'}")
    print(f"ZOOM_REDIRECT_URI: {getattr(settings, 'ZOOM_REDIRECT_URI', 'NOT SET')}")
    
    # Generate OAuth URL manually
    print("\n🔗 Generated OAuth URL:")
    params = {
        'response_type': 'code',
        'client_id': getattr(settings, 'ZOOM_CLIENT_ID', ''),
        'redirect_uri': getattr(settings, 'ZOOM_REDIRECT_URI', 'http://localhost:8000/api/accounts/zoom/callback/'),
        'state': 'test-state-123',
        'scope': 'user:read'
    }
    
    zoom_auth_url = f"https://zoom.us/oauth/authorize?{urlencode(params)}"
    print(f"{zoom_auth_url}")
    
    # Check if URL is valid
    print("\n✅ Verification:")
    if 'zoom.us/oauth/authorize' in zoom_auth_url:
        print("✅ OAuth URL format is correct")
    else:
        print("❌ OAuth URL format is incorrect")
        
    if getattr(settings, 'ZOOM_CLIENT_ID', ''):
        print("✅ Client ID is configured")
    else:
        print("❌ Client ID is missing")
        
    if 'api/accounts/zoom/callback' in getattr(settings, 'ZOOM_REDIRECT_URI', ''):
        print("✅ Redirect URI points to correct endpoint")
    else:
        print("❌ Redirect URI might be incorrect")
    
    print("\n🎯 Next Steps:")
    print("1. Copy the OAuth URL above")
    print("2. Test it manually in a browser")
    print("3. Check if it redirects to Zoom login (not marketplace)")
    print("4. Verify your Zoom OAuth app configuration in Zoom Marketplace")
    
    return zoom_auth_url

if __name__ == "__main__":
    test_zoom_oauth_config()