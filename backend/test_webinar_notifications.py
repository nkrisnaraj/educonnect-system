#!/usr/bin/env python3

import os
import sys
import django

# Add the backend directory to the Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(backend_dir)

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from students.models import Notification, StudentProfile
from django.contrib.auth import get_user_model
from edu_admin.notification_service import WebinarNotificationService

User = get_user_model()

def test_webinar_notifications():
    """Test the webinar notification system"""
    print("🔔 Testing Webinar Notification System...")
    print("=" * 50)
    
    try:
        # Find a test student - try Krisna first
        test_student = User.objects.filter(username='Krisna').first()
        if not test_student:
            # Fallback to any user with krisna in email
            test_student = User.objects.filter(email__icontains='krisna').first()
        if not test_student:
            print("❌ No test student found")
            return False
        
        print(f"👤 Test student: {test_student.username} ({test_student.email})")
        
        # Check if student has profile
        try:
            student_profile = StudentProfile.objects.get(user=test_student)
            print(f"📋 Student profile found: {student_profile.stuid}")
        except StudentProfile.DoesNotExist:
            print("❌ Student profile not found")
            return False
        
        # Test 1: Enrollment notification
        print("\n📋 Test 1: Enrollment Notification")
        enrollment_sent = WebinarNotificationService.send_webinar_enrollment_notification(
            student_user=test_student,
            class_name="Test Class Notification",
            webinar_topic="Test Webinar Topic",
            payment_amount=1500.00,
            payment_id="PAY-TEST123"
        )
        print(f"   Result: {'✅ Success' if enrollment_sent else '❌ Failed'}")
        
        # Test 2: Registration notification
        print("\n📝 Test 2: Registration Notification")
        registration_sent = WebinarNotificationService.send_webinar_registration_notification(
            student_user=test_student,
            webinar_topic="Test Webinar Topic",
            webinar_id="TEST-WEBINAR-456",
            payment_id="PAY-TEST123"
        )
        print(f"   Result: {'✅ Success' if registration_sent else '❌ Failed'}")
        
        # Test 3: Approval notification
        print("\n🎉 Test 3: Approval Notification")
        approval_sent = WebinarNotificationService.send_webinar_approval_notification(
            student_user=test_student,
            webinar_topic="Test Webinar Topic",
            webinar_id="TEST-WEBINAR-456",
            join_url="https://zoom.us/join/test123",
            payment_id="PAY-TEST123"
        )
        print(f"   Result: {'✅ Success' if approval_sent else '❌ Failed'}")
        
        # Check notifications in database
        print("\n📊 Checking Database...")
        notifications = Notification.objects.filter(
            student_id=student_profile,
            type='webinar'
        ).order_by('-created_at')[:5]
        
        print(f"   Found {notifications.count()} webinar notifications")
        for i, notif in enumerate(notifications, 1):
            print(f"   {i}. {notif.title} - {notif.created_at.strftime('%Y-%m-%d %H:%M')}")
            print(f"      Read: {'Yes' if notif.read_status else 'No'}")
        
        # Summary
        success_count = sum([enrollment_sent, registration_sent, approval_sent])
        print(f"\n📈 Summary:")
        print(f"   Tests passed: {success_count}/3")
        print(f"   Success rate: {(success_count/3)*100:.0f}%")
        
        if success_count == 3:
            print("\n🎉 ALL TESTS PASSED! Notification system is working perfectly!")
            return True
        else:
            print("\n⚠️ Some tests failed. Check the logs above.")
            return False
            
    except Exception as e:
        print(f"❌ Error testing notification system: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_student_notifications():
    """Check existing notifications for students"""
    print("\n🔍 Checking Existing Student Notifications...")
    print("=" * 50)
    
    try:
        # Get students with notifications
        students_with_notifications = Notification.objects.values(
            'student_id__user__username',
            'student_id__user__email'
        ).distinct()
        
        print(f"📊 Students with notifications: {len(students_with_notifications)}")
        
        for student in students_with_notifications:
            username = student['student_id__user__username']
            email = student['student_id__user__email']
            
            notifications = Notification.objects.filter(
                student_id__user__username=username
            )
            
            unread_count = notifications.filter(read_status=False).count()
            webinar_count = notifications.filter(type='webinar').count()
            
            print(f"   👤 {username} ({email})")
            print(f"      Total: {notifications.count()}, Unread: {unread_count}, Webinar: {webinar_count}")
            
    except Exception as e:
        print(f"❌ Error checking notifications: {e}")

if __name__ == "__main__":
    # Test the notification system
    success = test_webinar_notifications()
    
    # Check existing notifications
    check_student_notifications()
    
    if success:
        print("\n🚀 NOTIFICATION SYSTEM READY FOR PRODUCTION!")
        print("✅ Students will now receive notifications for:")
        print("   📋 Class enrollment")
        print("   📝 Webinar registration") 
        print("   🎉 Webinar approval")
    else:
        print("\n⚠️ Notification system needs attention")