#!/usr/bin/env python
"""
Test script for the instructor notification system
Run this script to test the notification functionality
"""

import os
import sys
import django
from datetime import datetime, timedelta

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from instructor.models import Class, Exam, InstructorNotification
from students.models import StudentProfile, Enrollment
from edu_admin.models import ZoomWebinar, ZoomOccurrence

User = get_user_model()

def test_notification_system():
    print("🧪 Testing Instructor Notification System")
    print("=" * 50)
    
    # Create test instructor
    try:
        instructor = User.objects.get(username='test_instructor')
        print("✅ Found test instructor")
    except User.DoesNotExist:
        instructor = User.objects.create_user(
            username='test_instructor',
            email='instructor@test.com',
            password='testpass123',
            first_name='Test',
            last_name='Instructor',
            role='instructor'
        )
        print("✅ Created test instructor")
    
    # Create test student
    try:
        student_user = User.objects.get(username='test_student')
        print("✅ Found test student")
    except User.DoesNotExist:
        student_user = User.objects.create_user(
            username='test_student',
            email='student@test.com',
            password='testpass123',
            first_name='Test',
            last_name='Student',
            role='student'
        )
        print("✅ Created test student")
        
        # Create student profile
        StudentProfile.objects.create(
            user=student_user,
            mobile='1234567890',
            nic_no='123456789V',
            address='Test Address',
            year_of_al='2025',
            school_name='Test School'
        )
        print("✅ Created student profile")
    
    # Test 1: Create a class (should trigger notification)
    print("\n📚 Test 1: Creating a new class...")
    test_class = Class.objects.create(
        title='Test Chemistry Class',
        description='A test class for chemistry',
        fee=5000.00,
        instructor=instructor,
        start_date=datetime.now().date(),
        end_date=(datetime.now() + timedelta(days=30)).date()
    )
    print(f"✅ Created class: {test_class.title}")
    
    # Check if notification was created
    class_notifications = InstructorNotification.objects.filter(
        instructor=instructor,
        type='class',
        title__icontains='New Class Created'
    )
    print(f"✅ Class notifications created: {class_notifications.count()}")
    
    # Test 2: Create an exam (should trigger notification)
    print("\n📝 Test 2: Creating a new exam...")
    test_exam = Exam.objects.create(
        examname='Test Chemistry Exam',
        description='A test exam for chemistry',
        classid=test_class,
        instructor=instructor,
        date=(datetime.now() + timedelta(days=7)).date(),
        start_time=datetime.now().time(),
        duration_minutes=120,
        total_marks=100
    )
    print(f"✅ Created exam: {test_exam.examname}")
    
    # Check if notification was created
    exam_notifications = InstructorNotification.objects.filter(
        instructor=instructor,
        type='exam',
        title__icontains='New Exam Created'
    )
    print(f"✅ Exam notifications created: {exam_notifications.count()}")
    
    # Test 3: Create enrollment (should trigger notification)
    print("\n👨‍🎓 Test 3: Creating student enrollment...")
    student_profile = StudentProfile.objects.get(user=student_user)
    enrollment = Enrollment.objects.create(
        stuid=student_profile,
        classid=test_class
    )
    print(f"✅ Created enrollment: Student {student_profile.user.first_name} enrolled in {test_class.title}")
    
    # Check if notification was created
    enrollment_notifications = InstructorNotification.objects.filter(
        instructor=instructor,
        type='enrollment',
        title__icontains='New Student Enrollment'
    )
    print(f"✅ Enrollment notifications created: {enrollment_notifications.count()}")
    
    # Test 4: Create a webinar (should trigger notification)
    print("\n🎥 Test 4: Creating a new webinar...")
    webinar = ZoomWebinar.objects.create(
        webinar_id='test_webinar_123',
        account_key='test_account',
        topic='Test Chemistry Webinar',
        start_time=datetime.now() + timedelta(days=3),
        duration=90,
        agenda='Test webinar agenda'
    )
    print(f"✅ Created webinar: {webinar.topic}")
    
    # Check if notification was created
    webinar_notifications = InstructorNotification.objects.filter(
        instructor=instructor,
        type='webinar',
        title__icontains='New Webinar Available'
    )
    print(f"✅ Webinar notifications created: {webinar_notifications.count()}")
    
    # Test 5: Create webinar occurrence (should trigger notification)
    print("\n📅 Test 5: Creating webinar occurrence...")
    occurrence = ZoomOccurrence.objects.create(
        webinar=webinar,
        occurrence_id='test_occurrence_123',
        start_time=datetime.now() + timedelta(days=5),
        duration=90
    )
    print(f"✅ Created webinar occurrence for: {webinar.topic}")
    
    # Check if notification was created
    occurrence_notifications = InstructorNotification.objects.filter(
        instructor=instructor,
        type='webinar',
        title__icontains='New Webinar Session'
    )
    print(f"✅ Webinar occurrence notifications created: {occurrence_notifications.count()}")
    
    # Summary
    print("\n📊 Summary:")
    print("=" * 50)
    total_notifications = InstructorNotification.objects.filter(instructor=instructor).count()
    unread_notifications = InstructorNotification.objects.filter(instructor=instructor, read=False).count()
    
    print(f"Total notifications for instructor: {total_notifications}")
    print(f"Unread notifications: {unread_notifications}")
    
    # List all notifications
    print("\n📋 All notifications:")
    for notification in InstructorNotification.objects.filter(instructor=instructor).order_by('-created_at'):
        status = "🔴 Unread" if not notification.read else "✅ Read"
        print(f"  {status} | {notification.type.upper()} | {notification.title}")
        print(f"      {notification.message}")
        print(f"      Created: {notification.created_at}")
        print()
    
    print("🎉 Notification system test completed successfully!")
    
    # Cleanup (optional)
    cleanup = input("\n🗑️  Do you want to cleanup test data? (y/n): ").lower().strip()
    if cleanup == 'y':
        # Delete test data
        InstructorNotification.objects.filter(instructor=instructor).delete()
        Class.objects.filter(instructor=instructor).delete()
        Exam.objects.filter(instructor=instructor).delete()
        Enrollment.objects.filter(classid__instructor=instructor).delete()
        ZoomWebinar.objects.filter(topic__icontains='Test').delete()
        User.objects.filter(username__in=['test_instructor', 'test_student']).delete()
        print("✅ Cleanup completed")

if __name__ == '__main__':
    test_notification_system()

