#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import authenticate
from accounts.models import User
import requests

def test_authentication():
    print("Testing Authentication...")
    
    # Test authentication directly
    user = authenticate(email='nkrisnaraj007@gmail.com', password='instructor123')
    print(f"Direct auth result: {user}")
    
    if not user:
        # Try with username
        user = authenticate(username='nkrisnaraj007@gmail.com', password='instructor123')
        print(f"Username auth result: {user}")
    
    # Check user details
    instructor = User.objects.get(email='nkrisnaraj007@gmail.com')
    print(f"User active: {instructor.is_active}")
    print(f"User email: {instructor.email}")
    print(f"Password check: {instructor.check_password('instructor123')}")
    
    # Test API login
    login_data = {
        'email': 'nkrisnaraj007@gmail.com',
        'password': 'instructor123'
    }
    
    try:
        response = requests.post('http://127.0.0.1:8000/api/accounts/login/', json=login_data)
        print(f"API Login Status: {response.status_code}")
        print(f"API Login Response: {response.text}")
    except Exception as e:
        print(f"API Login Error: {e}")

if __name__ == '__main__':
    test_authentication()