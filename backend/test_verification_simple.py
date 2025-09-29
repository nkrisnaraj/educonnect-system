#!/usr/bin/env python
"""
Simple test script to verify admin payment verification with enrollment
"""
import requests
import json

def test_payment_verification():
    """Test the payment verification endpoint"""
    print("🔍 Testing Payment Verification with Enrollment")
    print("=" * 50)
    
    # Admin login credentials (adjust as needed)
    admin_credentials = {
        'username': 'admin',
        'password': 'admin123'  # Replace with actual admin password
    }
    
    try:
        # Login to get JWT token
        login_response = requests.post(
            'http://127.0.0.1:8000/api/accounts/login/',
            json=admin_credentials,
            timeout=10
        )
        
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.status_code}")
            print(f"Response: {login_response.text}")
            return
            
        tokens = login_response.json()
        access_token = tokens.get('access')
        
        if not access_token:
            print("❌ No access token received")
            return
            
        print("✅ Admin login successful")
        
        # Test receipt verification endpoint
        receipt_id = "RCP-6F62FE"  # Use existing receipt ID
        url = f"http://127.0.0.1:8000/edu_admin/receipt-payments/{receipt_id}/verify/"
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        print(f"\n🌐 Testing verification endpoint: {url}")
        
        response = requests.post(url, headers=headers, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Verification successful!")
            print(f"Message: {data.get('detail', 'No message')}")
        else:
            print(f"❌ Verification failed with status {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - Make sure Django server is running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_payment_verification()