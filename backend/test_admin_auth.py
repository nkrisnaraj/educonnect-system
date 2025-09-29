#!/usr/bin/env python
"""
Test script to debug admin authentication for payment verification
"""
import os
import sys
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from accounts.models import User
from students.models import ReceiptPayment, Payment, StudentProfile
from rest_framework_simplejwt.tokens import RefreshToken
import requests

def test_admin_authentication():
    """Test admin authentication and permissions"""
    print("🔍 Testing Admin Authentication for Payment Verification")
    print("=" * 60)
    
    # Check if admin user exists
    try:
        admin_user = User.objects.filter(role='admin').first()
        if not admin_user:
            print("❌ No admin user found in database")
            return
        
        print(f"✅ Admin user found: {admin_user.username} (ID: {admin_user.id})")
        print(f"   Role: {admin_user.role}")
        print(f"   Is Active: {admin_user.is_active}")
        print(f"   Is Staff: {admin_user.is_staff}")
        print(f"   Is Superuser: {admin_user.is_superuser}")
        
        # Generate JWT token for admin
        refresh = RefreshToken.for_user(admin_user)
        access_token = str(refresh.access_token)
        print(f"✅ Generated JWT token for admin")
        
        # Check receipt payments
        receipts = ReceiptPayment.objects.all()[:5]
        print(f"📋 Found {ReceiptPayment.objects.count()} receipt payments in database")
        
        for receipt in receipts:
            print(f"   Receipt ID: {receipt.receiptid}, Verified: {receipt.verified}")
        
        # Test API endpoint directly
        if receipts:
            test_receipt = receipts[0]
            url = f"http://127.0.0.1:8000/edu_admin/receipt-payments/{test_receipt.receiptid}/verify/"
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            print(f"\n🌐 Testing API endpoint: {url}")
            print(f"   Using token: {access_token[:50]}...")
            
            try:
                response = requests.post(url, headers=headers, timeout=10)
                print(f"   Status Code: {response.status_code}")
                print(f"   Response: {response.text}")
                
                if response.status_code == 401:
                    print("❌ 401 Unauthorized - Authentication failed")
                elif response.status_code == 403:
                    print("❌ 403 Forbidden - Permission denied")
                elif response.status_code == 200:
                    print("✅ Success - Receipt verification worked")
                else:
                    print(f"⚠️  Unexpected status code: {response.status_code}")
                    
            except requests.exceptions.ConnectionError:
                print("❌ Connection failed - Make sure Django server is running")
            except Exception as e:
                print(f"❌ Request failed: {e}")
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()

def check_permissions():
    """Check permission classes and middleware"""
    print("\n🔒 Checking Permission Configuration")
    print("=" * 40)
    
    from edu_admin.permissions import IsAdminRole
    from rest_framework.request import Request
    from django.test import RequestFactory
    from rest_framework_simplejwt.authentication import JWTAuthentication
    
    # Check if IsAdminRole permission works
    admin_user = User.objects.filter(role='admin').first()
    if admin_user:
        factory = RequestFactory()
        request = factory.get('/')
        request.user = admin_user
        
        permission = IsAdminRole()
        has_permission = permission.has_permission(request, None)
        print(f"   IsAdminRole permission for {admin_user.username}: {has_permission}")
        
        # Check user attributes
        print(f"   User.role: {getattr(admin_user, 'role', 'NOT_FOUND')}")
        print(f"   User.is_authenticated: {admin_user.is_authenticated}")

if __name__ == "__main__":
    test_admin_authentication()
    check_permissions()