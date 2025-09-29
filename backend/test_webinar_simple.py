#!/usr/bin/env python
"""
Simple Webinar Integration Test - Mock Version
Tests the workflow without requiring Zoom API access
"""

import os
import sys
import django

# Add the project root to Python path
sys.path.append(os.path.join(os.path.dirname(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from students.models import Enrollment, ReceiptPayment, Payment, StudentProfile
from instructor.models import Class
from edu_admin.models import ZoomWebinarRegistration, ZoomWebinar
from edu_admin.views import ReceiptPaymentAdminViewSet
from rest_framework.test import APIRequestFactory
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

User = get_user_model()

def test_payment_and_enrollment():
    """Test the payment verification and enrollment workflow"""
    print("🚀 Testing Payment Verification and Enrollment")
    print("=" * 50)
    
    # Clean up any existing test data
    try:
        User.objects.filter(username__in=['test_student', 'test_instructor', 'admin']).delete()
        Class.objects.filter(title='Test Payment Class').delete()
        Payment.objects.filter(payid='PAY-TEST-001').delete()
    except Exception as e:
        print(f"ℹ️  Cleanup note: {e}")
    
    # Create test data
    print("🔧 Creating test data...")
    
    # Create instructor
    instructor, created = User.objects.get_or_create(
        username='test_instructor',
        defaults={
            'email': 'instructor@test.com',
            'password': 'testpass',
            'first_name': 'Test',
            'last_name': 'Instructor'
        }
    )
    if created:
        instructor.set_password('testpass')
        instructor.save()
    
    # Create student
    student, created = User.objects.get_or_create(
        username='test_student',
        defaults={
            'email': 'student@test.com',
            'password': 'testpass',
            'first_name': 'Test',
            'last_name': 'Student'
        }
    )
    if created:
        student.set_password('testpass')
        student.save()
    
    # Create or get student profile
    student_profile, created = StudentProfile.objects.get_or_create(
        user=student,
        defaults={
            'mobile': '1234567890',
            'nic_no': '123456789V',
            'address': 'Test Address',
            'city': 'Test City',
            'district': 'Test District',
            'year_of_al': '2023',
            'school_name': 'Test School'
        }
    )
    
    # Create or get class
    test_class, created = Class.objects.get_or_create(
        title='Test Payment Class',
        defaults={
            'instructor': instructor,
            'description': 'Test class for payment verification',
            'fee': 100.00
        }
    )
    
    # Create or get payment
    payment, created = Payment.objects.get_or_create(
        payid='PAY-TEST-001',
        defaults={
            'stuid': student,
            'method': 'receipt',
            'amount': 100.00,
            'status': 'pending',
            'class_names': 'Test Payment Class'
        }
    )
    
    # Create or get receipt payment
    receipt, created = ReceiptPayment.objects.get_or_create(
        payid=payment,
        defaults={
            'image_url': 'test_receipt.jpg',
            'verified': False,
            'paid_amount': '100.00'
        }
    )
    
    print(f"✅ Test data created:")
    print(f"   - Student: {student.username} ({student_profile.stuid})")
    print(f"   - Class: {test_class.title}")
    print(f"   - Payment: {payment.payid}")
    print(f"   - Receipt: {receipt.receiptid}")
    
    # Test payment verification
    print("\n💳 Testing payment verification...")
    
    # Create admin user
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@test.com',
            'is_superuser': True,
            'is_staff': True
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
    
    # Create request
    factory = APIRequestFactory()
    request = factory.post(f'/admin/receipt-payments/{receipt.receiptid}/verify/')
    request.user = admin_user
    
    # Test verification
    viewset = ReceiptPaymentAdminViewSet()
    viewset.request = request
    
    try:
        response = viewset.verify(request, receiptid=receipt.receiptid)
        print(f"✅ Payment verification successful: {response.status_code}")
        
        # Check if enrollment was created
        enrollments = Enrollment.objects.filter(
            stuid=student_profile,
            classid=test_class
        )
        
        if enrollments.exists():
            enrollment = enrollments.first()
            print(f"✅ Enrollment created: {enrollment}")
            return True
        else:
            print("❌ No enrollment found")
            return False
            
    except Exception as e:
        print(f"❌ Payment verification failed: {e}")
        return False

def test_webinar_database_models():
    """Test that webinar database models work correctly"""
    print("\n🎯 Testing Webinar Database Models")
    print("=" * 50)
    
    try:
        # Get the test class
        test_class = Class.objects.get(title='Test Payment Class')
        
        # Create or get a webinar
        from django.utils import timezone
        webinar, created = ZoomWebinar.objects.get_or_create(
            webinar_id='TEST-WEBINAR-123',
            defaults={
                'account_key': 'test_account',
                'topic': 'Test Webinar',
                'start_time': timezone.now(),
                'duration': 60
            }
        )
        
        # Link webinar to class if not already linked
        if not test_class.webinar:
            test_class.webinar = webinar
            test_class.save()
        
        print(f"✅ Webinar created/found and linked: {webinar.topic}")
        
        # Get student profile
        student_profile = StudentProfile.objects.get(user__username='test_student')
        
        # Create or get webinar registration record
        registration, created = ZoomWebinarRegistration.objects.get_or_create(
            student=student_profile.user,
            webinar=webinar,
            defaults={
                'registrant_id': 'TEST-REG-123',
                'status': 'approved'
            }
        )
        
        print(f"✅ Webinar registration created/found: {registration}")
        
        # Test querying
        registrations = ZoomWebinarRegistration.objects.filter(
            webinar=webinar,
            status='approved'
        )
        
        print(f"✅ Found {registrations.count()} approved registrations")
        print(f"✅ Database models working correctly")
        return True
        
    except Exception as e:
        print(f"❌ Webinar model test failed: {e}")
        return False

def run_tests():
    """Run all tests"""
    print("🚀 Starting Simple Webinar Integration Tests")
    print("=" * 60)
    
    results = {}
    
    # Test 1: Payment and Enrollment
    results['payment'] = test_payment_and_enrollment()
    
    # Test 2: Webinar Models
    results['webinar'] = test_webinar_database_models()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    for test_name, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{test_name.title():15} {status}")
    
    overall_success = all(results.values())
    overall_status = "✅ ALL TESTS PASSED" if overall_success else "❌ SOME TESTS FAILED"
    print(f"\nOverall Result: {overall_status}")
    
    if overall_success:
        print("\n🎉 Congratulations! Your webinar integration system is working correctly!")
        print("The following features are confirmed working:")
        print("✅ Payment verification")
        print("✅ Automatic enrollment after payment")
        print("✅ Webinar database models")
        print("✅ Webinar registration tracking")
        
        print("\nNext steps for production:")
        print("🔧 Configure Zoom OAuth with proper scopes")
        print("🔧 Set up scheduled approval checking")
        print("🔧 Add error handling for API failures")
    
    return overall_success

if __name__ == '__main__':
    run_tests()