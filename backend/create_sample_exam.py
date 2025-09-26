#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import User
from instructor.models import Exam, Class
from datetime import date, time

def create_sample_exam():
    print("Creating sample exam for testing...")
    
    # Get instructor
    instructor = User.objects.get(email='nkrisnaraj007@gmail.com')
    print(f"✓ Found instructor: {instructor.email}")
    
    # Get a class
    class_obj = Class.objects.filter(instructor=instructor).first()
    if not class_obj:
        print("✗ No classes found for instructor")
        return
    
    print(f"✓ Using class: {class_obj.title}")
    
    # Create a sample exam
    exam = Exam.objects.create(
        examname="Sample Physics Quiz",
        description="A sample quiz to test the exam system",
        classid=class_obj,
        instructor=instructor,
        date=date(2025, 9, 25),
        start_time=time(14, 0),
        duration_minutes=60,
        total_marks=50,
        passing_marks=25,
        status='published',
        is_published=True
    )
    
    print(f"✓ Created exam: {exam.examname} (ID: {exam.examid})")
    
    # Test API
    from rest_framework.test import APIClient
    client = APIClient()
    client.force_authenticate(user=instructor)
    response = client.get('/instructor/exams/')
    
    print(f"✓ API Status: {response.status_code}")
    if response.status_code == 200:
        data = response.data
        print(f"✓ Found {len(data['exams'])} exams in API response")
        for exam_data in data['exams']:
            print(f"  - {exam_data['examname']} ({exam_data['examid']})")
    
    return exam

if __name__ == '__main__':
    create_sample_exam()