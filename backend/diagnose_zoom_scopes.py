#!/usr/bin/env python3

import os
import sys
import django
import requests
import json

# Add the backend directory to the Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(backend_dir)

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from edu_admin.zoom_api import ZoomAPIClient

def check_token_scopes():
    """Check what scopes the current token has"""
    print("🔍 Checking Zoom OAuth Token Scopes...")
    
    try:
        from django.conf import settings
        
        # Check available Zoom accounts
        zoom_accounts = getattr(settings, 'ZOOM_ACCOUNTS', {})
        print(f"📋 Available Zoom accounts: {list(zoom_accounts.keys())}")
        
        # Try to find a working account
        account_key = None
        if zoom_accounts:
            account_key = list(zoom_accounts.keys())[0]
            print(f"🔧 Using account: {account_key}")
        else:
            print("❌ No Zoom accounts configured in settings")
            return
            
        zoom_client = ZoomAPIClient(account_key)
        token = zoom_client.get_access_token()
        
        # Get user info to check token validity and scopes
        headers = {
            "Authorization": f"Bearer {token}"
        }
        
        # Try to get user information
        response = requests.get("https://api.zoom.us/v2/users/me", headers=headers)
        
        if response.status_code == 200:
            user_info = response.json()
            print(f"✅ Token is valid for user: {user_info.get('email', 'Unknown')}")
            print(f"📧 Account ID: {user_info.get('account_id', 'Unknown')}")
        else:
            print(f"❌ Token validation failed: {response.status_code}")
            print(f"📄 Response: {response.text}")
        
        # Test webinar read scope
        print("\n🔍 Testing webinar scopes...")
        
        # Test basic webinar read
        test_response = requests.get("https://api.zoom.us/v2/users/me/webinars", headers=headers)
        if test_response.status_code == 200:
            print("✅ webinar:read scope: WORKING")
        else:
            print(f"❌ webinar:read scope: FAILED ({test_response.status_code})")
        
        # Test webinar registrant read (for a known webinar)
        test_webinar_id = "89714995008"  # Test class 7
        registrant_response = requests.get(
            f"https://api.zoom.us/v2/webinars/{test_webinar_id}/registrants?status=pending", 
            headers=headers
        )
        if registrant_response.status_code == 200:
            print("✅ webinar:read:list_registrants scope: WORKING")
            registrants = registrant_response.json()
            print(f"📊 Found {len(registrants.get('registrants', []))} pending registrants")
        else:
            print(f"❌ webinar:read:list_registrants scope: FAILED ({registrant_response.status_code})")
        
        # Test webinar registrant status update (the failing one)
        test_payload = {
            "action": "approve",
            "registrants": [{"id": "test-id"}]
        }
        approval_response = requests.put(
            f"https://api.zoom.us/v2/webinars/{test_webinar_id}/registrants/status",
            headers={**headers, "Content-Type": "application/json"},
            json=test_payload
        )
        
        if approval_response.status_code == 204:
            print("✅ webinar:update:registrant_status scope: WORKING")
        elif approval_response.status_code == 400:
            try:
                error_data = approval_response.json()
                if error_data.get('code') == 4711:
                    print("❌ webinar:update:registrant_status scope: MISSING")
                    print("🔧 Required scopes: webinar:update:registrant_status, webinar:update:registrant_status:admin")
                else:
                    print(f"⚠️ webinar:update:registrant_status scope: UNCLEAR ({approval_response.status_code})")
                    print(f"📄 Response: {approval_response.text}")
            except:
                print(f"⚠️ webinar:update:registrant_status scope: UNCLEAR ({approval_response.status_code})")
                print(f"📄 Response: {approval_response.text}")
        else:
            print(f"⚠️ webinar:update:registrant_status scope: UNCLEAR ({approval_response.status_code})")
            print(f"📄 Response: {approval_response.text}")
            
    except Exception as e:
        print(f"❌ Error checking token scopes: {e}")
        import traceback
        traceback.print_exc()

def print_scope_requirements():
    """Print the required scopes for the application"""
    print("\n📋 REQUIRED ZOOM OAUTH SCOPES:")
    print("=" * 50)
    
    required_scopes = [
        ("webinar:read:admin", "Read webinar information"),
        ("webinar:write:admin", "Create and manage webinars"),
        ("webinar:read:list_registrants:admin", "Read webinar registrants"),
        ("webinar:update:registrant_status:admin", "⭐ APPROVE/DENY registrants"),
        ("webinar:update:registrant_status", "⭐ APPROVE/DENY registrants (alternative)"),
        ("user:read:admin", "Read user information")
    ]
    
    for scope, description in required_scopes:
        print(f"  ✓ {scope:<40} - {description}")
    
    print("\n🔧 TO FIX:")
    print("1. Go to https://marketplace.zoom.us/")
    print("2. Navigate to your OAuth app")
    print("3. Add missing scopes (marked with ⭐)")
    print("4. Reauthorize the application")

if __name__ == "__main__":
    check_token_scopes()
    print_scope_requirements()