#!/usr/bin/env python
"""
Complete Webinar Integration Test
Tests the full workflow: Payment → Enrollment → Webinar Registration → Approval
"""

import os
import sys
import django
import json

# Add the project root to Python path
sys.path.append(os.path.join(os.path.dirname(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from students.models import Enrollment, ReceiptPayment, Payment, StudentProfile
from instructor.models import Class
from edu_admin.models import ZoomWebinarRegistration, ZoomWebinar
from edu_admin.services import register_student_for_class_webinar, check_and_approve_paid_registrations
from edu_admin.zoom_api import ZoomAPIClient
from edu_admin.views import ReceiptPaymentAdminViewSet
from django.test import RequestFactory
from rest_framework.test import APIRequestFactory
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

User = get_user_model()

def create_test_data():
    """Create test data for the workflow"""
    print("🔧 Setting up test data...")
    
    # Create test student
    student = User.objects.filter(email='test.student@example.com').first()
    if not student:
        student = User.objects.create_user(
            username='test_student',
            email='test.student@example.com',
            password='testpass123',
            first_name='Test',
            last_name='Student'
        )
    
    # Create student profile
    student_profile = StudentProfile.objects.filter(user=student).first()
    if not student_profile:
        student_profile = StudentProfile.objects.create(
            user=student,
            mobile='1234567890',
            nic_no='123456789V',
            address='Test Address',
            city='Test City',
            district='Test District',
            year_of_al='2023',
            school_name='Test School'
        )
    
    # Create test instructor
    instructor = User.objects.filter(email='test.instructor@example.com').first()
    if not instructor:
        instructor = User.objects.create_user(
            username='test_instructor',
            email='test.instructor@example.com',
            password='testpass123',
            first_name='Test',
            last_name='Instructor'
        )
    
    # Create test class
    test_class = Class.objects.filter(title='Test Webinar Class').first()
    if not test_class:
        test_class = Class.objects.create(
            title='Test Webinar Class',
            instructor=instructor,
            description='Test class for webinar integration',
            fee=100.00
        )
    
    # Create test webinar
    webinar = ZoomWebinar.objects.filter(id__isnull=False).first()
    if not webinar:
        webinar = ZoomWebinar.objects.create(
            webinar_id='123456789',
            account_key='test_account',
            topic='Test Integration Webinar',
            start_time='2024-12-30T10:00:00Z',
            duration=60
        )
    
    # Link webinar to class
    if not test_class.webinar:
        test_class.webinar = webinar
        test_class.save()
    
    # Create test payment and receipt
    payment = Payment.objects.filter(stuid=student, class_names__icontains='Test Webinar Class').first()
    if not payment:
        payment = Payment.objects.create(
            payid='PAY-TEST-123',
            stuid=student,
            method='receipt',
            amount=100.00,
            status='pending',
            class_names='Test Webinar Class'
        )
    
    receipt = ReceiptPayment.objects.filter(payid=payment).first()
    if not receipt:
        receipt = ReceiptPayment.objects.create(
            payid=payment,
            image_url='test_receipt.jpg',
            verified=False,
            paid_amount='100.00'
        )
    
    return {
        'student': student,
        'student_profile': student_profile,
        'instructor': instructor,
        'class': test_class,
        'webinar': webinar,
        'payment': payment,
        'receipt': receipt
    }

def test_payment_verification_and_enrollment(test_data):
    """Test payment verification and automatic enrollment"""
    print("\n💳 Testing payment verification and enrollment...")
    
    receipt = test_data['receipt']
    
    # Simulate payment verification via admin
    factory = APIRequestFactory()
    request = factory.post(f'/admin/receipt-payments/{receipt.receiptid}/verify/')
    
    # Create admin user for the request
    admin_user = User.objects.filter(is_superuser=True).first()
    if not admin_user:
        admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123'
        )
    
    request.user = admin_user
    
    # Test the verification process
    viewset = ReceiptPaymentAdminViewSet()
    viewset.request = request
    
    try:
        response = viewset.verify(request, receiptid=receipt.receiptid)
        print(f"✅ Payment verification response: {response.status_code}")
        
        # Check if enrollment was created
        enrollment = Enrollment.objects.filter(
            stuid=test_data['student_profile'],
            classid=test_data['class']
        ).first()
        
        if enrollment:
            print(f"✅ Enrollment created successfully: {enrollment}")
            return True
        else:
            print("❌ Enrollment not created")
            return False
            
    except Exception as e:
        print(f"❌ Payment verification failed: {e}")
        return False

def test_webinar_registration(test_data):
    """Test automatic webinar registration after enrollment"""
    print("\n🎯 Testing webinar registration...")
    
    try:
        # Get the enrollment
        enrollment = Enrollment.objects.get(
            stuid=test_data['student_profile'],
            classid=test_data['class']
        )
        
        # Test webinar registration
        result = register_student_for_class_webinar(
            student=test_data['student_profile'],
            class_obj=test_data['class']
        )
        
        if result['success']:
            print(f"✅ Webinar registration successful: {result['message']}")
            
            # Check database record
            registration = ZoomWebinarRegistration.objects.filter(
                student=test_data['student'],
                webinar=test_data['webinar']
            ).first()
            
            if registration:
                print(f"✅ Registration record created: {registration}")
                return True
            else:
                print("❌ Registration record not found in database")
                return False
        else:
            print(f"❌ Webinar registration failed: {result['error']}")
            return False
            
    except Exception as e:
        print(f"❌ Webinar registration test failed: {e}")
        return False

def test_approval_process(test_data):
    """Test automatic approval of paid registrations"""
    print("\n✅ Testing approval process...")
    
    try:
        # Test the approval process
        result = check_and_approve_paid_registrations()
        
        if result['success']:
            print(f"✅ Approval process completed: {result['total_approved']} approved")
            
            # Check if our test registration was processed
            registration = ZoomWebinarRegistration.objects.filter(
                student=test_data['student'],
                webinar=test_data['webinar']
            ).first()
            
            if registration:
                print(f"📊 Registration status: {registration.status}")
                return True
            else:
                print("❌ Registration not found")
                return False
        else:
            print(f"❌ Approval process failed: {result['error']}")
            return False
            
    except Exception as e:
        print(f"❌ Approval process test failed: {e}")
        return False

def run_complete_test():
    """Run the complete integration test"""
    print("🚀 Starting Complete Webinar Integration Test")
    print("=" * 50)
    
    # Setup test data
    test_data = create_test_data()
    print(f"✅ Test data created: {test_data['student'].email}")
    
    # Test each step
    results = {}
    
    # Step 1: Payment verification and enrollment
    results['payment'] = test_payment_verification_and_enrollment(test_data)
    
    # Step 2: Webinar registration
    if results['payment']:
        results['registration'] = test_webinar_registration(test_data)
    else:
        results['registration'] = False
        print("⏭️ Skipping webinar registration (payment failed)")
    
    # Step 3: Approval process
    if results['registration']:
        results['approval'] = test_approval_process(test_data)
    else:
        results['approval'] = False
        print("⏭️ Skipping approval process (registration failed)")
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 50)
    
    for step, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{step.title():15} {status}")
    
    overall_success = all(results.values())
    overall_status = "✅ ALL TESTS PASSED" if overall_success else "❌ SOME TESTS FAILED"
    print(f"\nOverall Result: {overall_status}")
    
    return overall_success

if __name__ == '__main__':
    run_complete_test()