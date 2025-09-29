#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from rest_framework.test import APIClient
from accounts.models import User
from instructor.models import Class

def test_webinar_api():
    print("Testing Webinar API Integration...")
    
    # Get instructor
    try:
        instructor = User.objects.get(email='nkrisnaraj007@gmail.com')
        print(f"✓ Found instructor: {instructor.email}")
    except User.DoesNotExist:
        print("✗ Instructor not found")
        return
    
    # Check classes with webinars
    classes_with_webinars = Class.objects.filter(instructor=instructor, webinar__isnull=False)
    print(f"✓ Classes with webinars: {classes_with_webinars.count()}")
    
    if classes_with_webinars.exists():
        sample_class = classes_with_webinars.first()
        print(f"✓ Sample class: {sample_class.title}")
        print(f"✓ Webinar ID: {sample_class.webinar.webinar_id}")
        print(f"✓ Webinar Topic: {sample_class.webinar.topic}")
    
    # Test API endpoint
    client = APIClient()
    client.force_authenticate(user=instructor)
    response = client.get('/instructor/instructor/classes/')
    
    print(f"✓ API Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.data
        if 'classes' in data and data['classes']:
            first_class = data['classes'][0]
            print(f"✓ Response keys: {list(first_class.keys())}")
            
            if 'webinar_info' in first_class:
                webinar_info = first_class['webinar_info']
                print(f"✓ Webinar info found: {webinar_info}")
            else:
                print("✗ No webinar_info in response")
                print(f"✓ Available fields: {list(first_class.keys())}")
        else:
            print("✗ No classes in response")
    else:
        print(f"✗ API Error: {response.status_code}")

if __name__ == '__main__':
    test_webinar_api()