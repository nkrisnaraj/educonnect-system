#!/usr/bin/env python
"""
Test script to verify webinar registration functionality after enrollment
"""
import os
import sys
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

def test_webinar_registration_flow():
    """Test the complete webinar registration flow"""
    print("🎥 Testing Webinar Registration After Enrollment")
    print("=" * 60)
    
    try:
        from accounts.models import User
        from students.models import StudentProfile, Payment, ReceiptPayment, Enrollment
        from instructor.models import Class
        from edu_admin.models import ZoomWebinar, ZoomWebinarRegistration
        from edu_admin.services import register_student_for_class_webinar
        
        # Check if we have test data
        students = StudentProfile.objects.all()[:3]
        classes = Class.objects.filter(webinar__isnull=False)[:3]
        webinars = ZoomWebinar.objects.all()[:3]
        
        print(f"📊 Available Test Data:")
        print(f"   Students: {students.count()}")
        print(f"   Classes with webinars: {classes.count()}")
        print(f"   Total webinars: {webinars.count()}")
        
        if not students.exists():
            print("❌ No students found in database")
            return
            
        if not classes.exists():
            print("❌ No classes with webinars found")
            return
        
        # Test webinar registration for each student-class combination
        for student in students:
            for class_obj in classes:
                print(f"\n🔍 Testing: {student.user.username} → {class_obj.title}")
                print(f"   Student email: {student.user.email}")
                print(f"   Class webinar: {class_obj.webinar.topic if class_obj.webinar else 'None'}")
                
                # Test registration function (without actually calling Zoom API)
                if student.user.email and class_obj.webinar:
                    try:
                        # Check if already registered
                        existing_registration = ZoomWebinarRegistration.objects.filter(
                            student=student.user,
                            webinar=class_obj.webinar
                        ).first()
                        
                        if existing_registration:
                            print(f"   ✅ Already registered (Status: {existing_registration.status})")
                        else:
                            print(f"   ℹ️  Would register for webinar: {class_obj.webinar.topic}")
                            print(f"   ℹ️  Webinar ID: {class_obj.webinar.webinar_id}")
                            print(f"   ℹ️  Account Key: {class_obj.webinar.account_key}")
                    except Exception as e:
                        print(f"   ❌ Error: {e}")
                else:
                    if not student.user.email:
                        print(f"   ⚠️  Student has no email")
                    if not class_obj.webinar:
                        print(f"   ⚠️  Class has no webinar")
        
        # Show existing registrations
        registrations = ZoomWebinarRegistration.objects.select_related('student', 'webinar').all()
        print(f"\n📋 Existing Webinar Registrations: {registrations.count()}")
        
        for registration in registrations[:10]:  # Show first 10
            print(f"   {registration.student.username} → {registration.webinar.topic} ({registration.status})")
        
        print(f"\n✅ Test completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()

def show_zoom_configuration():
    """Show current Zoom configuration"""
    print("\n🔧 Zoom Configuration Check")
    print("=" * 40)
    
    try:
        zoom_accounts = getattr(settings, 'ZOOM_ACCOUNTS', {})
        print(f"Configured Zoom accounts: {len(zoom_accounts)}")
        
        for key, account in zoom_accounts.items():
            print(f"   Account: {key}")
            print(f"   Client ID: {account.get('client_id', 'Not set')[:20]}...")
            print(f"   Account ID: {account.get('account_id', 'Not set')}")
            print(f"   User ID: {account.get('user_id', 'Not set')}")
    except Exception as e:
        print(f"❌ Error checking Zoom config: {e}")

if __name__ == "__main__":
    show_zoom_configuration()
    test_webinar_registration_flow()