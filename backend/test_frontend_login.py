#!/usr/bin/env python3

import requests
import json

def test_login():
    """Test login exactly as frontend should do it"""
    
    # Backend URL
    url = "http://127.0.0.1:8000/api/accounts/login/"
    
    # Test data - exactly what frontend should send
    login_data = {
        "username": "nkrisnaraj007@gmail.com",
        "password": "instructor123"
    }
    
    # Headers that frontend might send
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    print("🧪 Testing frontend login simulation")
    print(f"URL: {url}")
    print(f"Data: {login_data}")
    print(f"Headers: {headers}")
    print("-" * 50)
    
    try:
        # Make the request
        response = requests.post(url, json=login_data, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ Login successful!")
            print(f"User ID: {data.get('user', {}).get('id')}")
            print(f"Username: {data.get('user', {}).get('username')}")
            print(f"Email: {data.get('user', {}).get('email')}")
            print(f"Role: {data.get('user', {}).get('role')}")
            print(f"Access Token: {data.get('access', 'N/A')[:50]}...")
        else:
            print("\n❌ Login failed!")
            try:
                error_data = response.json()
                print(f"Error details: {error_data}")
            except:
                print(f"Raw error: {response.text}")
                
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_login()