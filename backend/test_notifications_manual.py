#!/usr/bin/env python
"""
Manual test script for notifications
Run this to test if notifications are being created
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
from students.models import StudentProfile, Enrollment, Message, ChatRoom
from edu_admin.models import ZoomWebinar

User = get_user_model()

def test_notifications():
    print("🧪 Manual Notification Test")
    print("=" * 40)
    
    # Get instructor
    instructor = User.objects.filter(role='instructor').first()
    if not instructor:
        print("❌ No instructor found")
        return
    
    print(f"👨‍🏫 Testing with instructor: {instructor.username}")
    
    # Check existing notifications
    existing_count = InstructorNotification.objects.filter(instructor=instructor).count()
    print(f"📊 Existing notifications: {existing_count}")
    
    # Test 1: Create a class
    print("\n1️⃣ Testing class creation...")
    test_class = Class.objects.create(
        title='Test Class for Notifications',
        description='Testing notification system',
        fee=5000.00,
        instructor=instructor,
        start_date=datetime.now().date(),
        end_date=(datetime.now() + timedelta(days=30)).date()
    )
    print(f"✅ Created class: {test_class.title}")
    
    # Check if notification was created
    new_count = InstructorNotification.objects.filter(instructor=instructor).count()
    print(f"📊 Notifications after class creation: {new_count}")
    
    # Test 2: Create an exam
    print("\n2️⃣ Testing exam creation...")
    test_exam = Exam.objects.create(
        examname='Test Exam for Notifications',
        description='Testing exam notifications',
        classid=test_class,
        instructor=instructor,
        date=(datetime.now() + timedelta(days=7)).date(),
        start_time=datetime.now().time(),
        duration_minutes=120,
        total_marks=100
    )
    print(f"✅ Created exam: {test_exam.examname}")
    
    # Check if notification was created
    new_count = InstructorNotification.objects.filter(instructor=instructor).count()
    print(f"📊 Notifications after exam creation: {new_count}")
    
    # Test 3: Create a student and enrollment
    print("\n3️⃣ Testing enrollment...")
    student_user = User.objects.filter(role='student').first()
    if not student_user:
        print("❌ No student found")
        return
    
    student_profile = StudentProfile.objects.get(user=student_user)
    enrollment = Enrollment.objects.create(
        stuid=student_profile,
        classid=test_class
    )
    print(f"✅ Created enrollment for student: {student_profile.user.username}")
    
    # Check if notification was created
    new_count = InstructorNotification.objects.filter(instructor=instructor).count()
    print(f"📊 Notifications after enrollment: {new_count}")
    
    # Test 4: Create a message
    print("\n4️⃣ Testing message creation...")
    chat_room, created = ChatRoom.objects.get_or_create(
        created_by=student_user,
        name='instructor'
    )
    
    message = Message.objects.create(
        chat_room=chat_room,
        sender=student_user,
        content='Test message for notifications',
        message_type='text'
    )
    print(f"✅ Created message from student: {student_user.username}")
    
    # Check if notification was created
    new_count = InstructorNotification.objects.filter(instructor=instructor).count()
    print(f"📊 Notifications after message: {new_count}")
    
    # Show all notifications
    print("\n📋 All notifications:")
    notifications = InstructorNotification.objects.filter(instructor=instructor).order_by('-created_at')
    for i, n in enumerate(notifications, 1):
        status = "🔴" if not n.read else "✅"
        print(f"  {i}. {status} {n.type.upper()}: {n.title}")
        print(f"     {n.message}")
        print(f"     Created: {n.created_at}")
        print()
    
    print(f"🎉 Test completed! Total notifications: {notifications.count()}")

if __name__ == '__main__':
    test_notifications()
