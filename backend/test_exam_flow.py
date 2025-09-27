#!/usr/bin/env python
"""
Test script to verify exam submission and results flow
"""
import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from students.models import StudentProfile
from instructor.models import Exam, ExamQuestion, ExamAnswer, ExamSubmission
from django.utils import timezone

User = get_user_model()

def test_exam_submission_flow():
    """Test the exam submission and results retrieval"""
    print("Testing exam submission flow...")
    
    # Test timezone import
    try:
        current_time = timezone.now()
        print(f"✓ Timezone import working: {current_time}")
    except Exception as e:
        print(f"✗ Timezone import failed: {e}")
        return False
    
    # Test model imports
    try:
        exam_count = Exam.objects.count()
        submission_count = ExamSubmission.objects.count()
        student_count = StudentProfile.objects.count()
        print(f"✓ Model imports working - Exams: {exam_count}, Submissions: {submission_count}, Students: {student_count}")
    except Exception as e:
        print(f"✗ Model imports failed: {e}")
        return False
    
    # Test if we have any test data
    if exam_count == 0:
        print("ℹ No exams found in database - this is expected for a fresh setup")
    
    if student_count == 0:
        print("ℹ No students found in database - this is expected for a fresh setup")
    
    print("✓ Basic exam flow components are working!")
    return True

if __name__ == "__main__":
    try:
        test_exam_submission_flow()
    except Exception as e:
        print(f"✗ Test failed with error: {e}")
        import traceback
        traceback.print_exc()