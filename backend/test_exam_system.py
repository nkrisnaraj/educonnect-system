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
from instructor.models import Exam, Class

def test_exam_system():
    print("Testing Enhanced Exam System...")
    
    # Get instructor
    try:
        instructor = User.objects.get(email='nkrisnaraj007@gmail.com')
        print(f"✓ Found instructor: {instructor.email}")
    except User.DoesNotExist:
        print("✗ Instructor not found")
        return
    
    # Check classes
    classes = Class.objects.filter(instructor=instructor)
    print(f"✓ Instructor has {classes.count()} classes")
    
    # Check exams
    exams = Exam.objects.filter(instructor=instructor)
    print(f"✓ Instructor has {exams.count()} exams")
    
    # Test API endpoint
    client = APIClient()
    client.force_authenticate(user=instructor)
    response = client.get('/instructor/exams/')
    
    print(f"✓ API Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.data
        print(f"✓ API Response: {data}")
    else:
        print(f"✗ API Error: {response.status_code}")
        print(f"✗ Error Details: {response.data}")

if __name__ == '__main__':
    test_exam_system()