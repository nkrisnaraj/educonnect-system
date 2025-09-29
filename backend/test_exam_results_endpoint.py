#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test.client import Client
from django.contrib.auth import get_user_model
from instructor.models import Exam, ExamSubmission, Class
from students.models import StudentProfile

User = get_user_model()

def test_exam_results_endpoint():
    print("🧪 Testing exam results endpoint...")
    
    # Create test client
    client = Client()
    
    # Try to find an instructor user
    try:
        instructor = User.objects.filter(role='instructor').first()
        if not instructor:
            print("❌ No instructor users found in database")
            return
        
        print(f"👨‍🏫 Found instructor: {instructor.email}")
        
        # Check if instructor has any exams
        exams = Exam.objects.filter(instructor=instructor)
        print(f"📚 Instructor has {exams.count()} exams")
        
        for exam in exams:
            submissions = ExamSubmission.objects.filter(exam=exam)
            print(f"  - {exam.examname}: {submissions.count()} submissions")
        
        # Try to access the endpoint (without authentication for now)
        print("\n🔗 Testing endpoint without authentication:")
        response = client.get('/instructor/exam-results/')
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 401:
            print("✅ Endpoint requires authentication (expected)")
        elif response.status_code == 200:
            print("✅ Endpoint accessible")
            print(f"Response data keys: {list(response.json().keys())}")
        else:
            print(f"❓ Unexpected status code: {response.status_code}")
            print(f"Response: {response.content}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    test_exam_results_endpoint()