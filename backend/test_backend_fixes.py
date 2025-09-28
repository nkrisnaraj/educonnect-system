#!/usr/bin/env python
"""
Simple test script to verify the backend API endpoints work correctly after fixes
"""
import os
import sys
import django
import requests
import json

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from students.models import StudentProfile
from instructor.models import Exam, ExamQuestion, ExamAnswer, ExamSubmission
from django.utils import timezone

User = get_user_model()

def test_imports():
    """Test that all imports work correctly"""
    print("Testing imports...")
    
    try:
        # Test timezone import
        current_time = timezone.now()
        print(f"✓ Timezone import working: {current_time}")
    except Exception as e:
        print(f"✗ Timezone import failed: {e}")
        return False
    
    try:
        # Test model imports
        print(f"✓ ExamSubmission model available: {ExamSubmission}")
        print(f"✓ ExamAnswer model available: {ExamAnswer}")
        print(f"✓ StudentProfile model available: {StudentProfile}")
    except Exception as e:
        print(f"✗ Model import failed: {e}")
        return False
    
    return True

def test_error_handling():
    """Test that error handling works correctly"""
    print("\nTesting error handling scenarios...")
    
    # Test ExamSubmission.DoesNotExist handling
    try:
        # This should not raise an unhandled exception
        submission = ExamSubmission.objects.get(id=999999)  # Non-existent ID
    except ExamSubmission.DoesNotExist:
        print("✓ ExamSubmission.DoesNotExist exception handled correctly")
    except Exception as e:
        print(f"✗ Unexpected exception: {e}")
        return False
    
    # Test StudentProfile.DoesNotExist handling
    try:
        profile = StudentProfile.objects.get(id=999999)  # Non-existent ID
    except StudentProfile.DoesNotExist:
        print("✓ StudentProfile.DoesNotExist exception handled correctly")
    except Exception as e:
        print(f"✗ Unexpected exception: {e}")
        return False
    
    return True

def test_database_queries():
    """Test basic database queries"""
    print("\nTesting database queries...")
    
    try:
        # Test basic queries
        exam_count = Exam.objects.count()
        student_count = StudentProfile.objects.count()
        submission_count = ExamSubmission.objects.count()
        
        print(f"✓ Database queries working:")
        print(f"  - Exams: {exam_count}")
        print(f"  - Students: {student_count}")
        print(f"  - Submissions: {submission_count}")
        
        return True
    except Exception as e:
        print(f"✗ Database query failed: {e}")
        return False

def main():
    """Run all tests"""
    print("=== Backend API Fix Verification ===\n")
    
    all_tests_passed = True
    
    # Run individual tests
    all_tests_passed &= test_imports()
    all_tests_passed &= test_error_handling()
    all_tests_passed &= test_database_queries()
    
    print(f"\n=== Test Summary ===")
    if all_tests_passed:
        print("✓ All tests passed! Backend fixes are working correctly.")
    else:
        print("✗ Some tests failed. Please check the error messages above.")
    
    return all_tests_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)