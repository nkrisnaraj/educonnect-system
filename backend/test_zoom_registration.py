#!/usr/bin/env python
"""
Comprehensive test script for Zoom webinar registration debugging
"""
import os
import sys
import django

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from instructor.models import Class
from edu_admin.models import ZoomWebinar, ZoomWebinarRegistration
from students.models import StudentProfile, Payment
from accounts.models import User
from edu_admin.zoom_api import ZoomAPIClient
from edu_admin.services import register_student_for_class_webinar

def test_webinar_registration():
    """Test the complete webinar registration flow"""
    print('🧪 Testing Zoom Webinar Registration Flow')
    print('=' * 60)
    
    try:
        # 1. Find Test Payment Class and verify webinar association
        print('\n1️⃣ Checking Test Payment Class and Webinar Association')
        test_class = Class.objects.filter(title='Test Payment Class').first()
        if not test_class:
            print('❌ Test Payment Class not found')
            return False
            
        print(f'✅ Found class: {test_class.title} (ID: {test_class.classid})')
        print(f'   Associated webinar: {test_class.webinar}')
        
        if not test_class.webinar:
            print('❌ Class has no associated webinar')
            return False
            
        webinar = test_class.webinar
        print(f'✅ Webinar details: {webinar.topic} (Zoom ID: {webinar.webinar_id})')
        
        # 2. Find a test student with successful payment
        print('\n2️⃣ Finding Test Student with Payment')
        payment = Payment.objects.filter(
            class_names__icontains='Test Payment Class',
            status='success'
        ).first()
        
        if not payment:
            print('❌ No successful payment found for Test Payment Class')
            return False
            
        student_user = payment.stuid
        student_profile = student_user.student_profile
        
        print(f'✅ Found student: {student_user.username} ({student_user.email})')
        print(f'   Payment ID: {payment.payid}, Status: {payment.status}')
        
        # 3. Test Zoom API connection
        print('\n3️⃣ Testing Zoom API Connection')
        try:
            zoom_client = ZoomAPIClient(webinar.account_key)
            token = zoom_client.get_access_token()
            print(f'✅ Zoom API token obtained: {token[:20]}...')
        except Exception as e:
            print(f'❌ Zoom API connection failed: {e}')
            return False
            
        # 4. Test webinar details fetch
        print('\n4️⃣ Testing Webinar Details Fetch')
        try:
            webinar_details = zoom_client.get_webinar_detail(webinar.webinar_id)
            print(f'✅ Webinar details fetched: {webinar_details.get("topic")}')
            print(f'   Registration required: {webinar_details.get("settings", {}).get("registration_type")}')
        except Exception as e:
            print(f'❌ Failed to fetch webinar details: {e}')
            return False
            
        # 5. Test actual registration
        print('\n5️⃣ Testing Student Registration')
        try:
            # Check if already registered
            existing_reg = ZoomWebinarRegistration.objects.filter(
                student=student_user,
                webinar=webinar
            ).first()
            
            if existing_reg:
                print(f'ℹ️  Student already registered (Status: {existing_reg.status})')
                print(f'   Registration ID: {existing_reg.id}')
            else:
                print('📝 Attempting to register student...')
                
                # Attempt registration
                result = register_student_for_class_webinar(student_profile, test_class)
                
                if result['success']:
                    print(f'✅ Registration successful: {result["message"]}')
                    if 'registration_id' in result:
                        print(f'   Registration ID: {result["registration_id"]}')
                    if 'zoom_registrant_id' in result:
                        print(f'   Zoom Registrant ID: {result["zoom_registrant_id"]}')
                else:
                    print(f'❌ Registration failed: {result["message"]}')
                    return False
                    
        except Exception as e:
            print(f'❌ Registration process error: {e}')
            import traceback
            traceback.print_exc()
            return False
            
        # 6. Verify registration in database
        print('\n6️⃣ Verifying Registration in Database')
        final_reg = ZoomWebinarRegistration.objects.filter(
            student=student_user,
            webinar=webinar
        ).first()
        
        if final_reg:
            print(f'✅ Registration found in database:')
            print(f'   ID: {final_reg.id}')
            print(f'   Status: {final_reg.status}')
            print(f'   Email: {final_reg.email}')
            print(f'   Zoom Registrant ID: {final_reg.zoom_registrant_id}')
        else:
            print('❌ No registration found in database')
            return False
            
        # 7. Test Zoom API direct registration call
        print('\n7️⃣ Testing Direct Zoom API Registration Call')
        try:
            direct_response = zoom_client.register_for_webinar(
                webinar_id=webinar.webinar_id,
                email=student_user.email,
                first_name=student_user.first_name or student_user.username,
                last_name=student_user.last_name or "Student"
            )
            print(f'✅ Direct Zoom API call successful:')
            print(f'   Response: {direct_response}')
        except Exception as e:
            print(f'❌ Direct Zoom API call failed: {e}')
            
        return True
        
    except Exception as e:
        print(f'❌ Test failed with error: {e}')
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = test_webinar_registration()
    
    print('\n' + '=' * 60)
    if success:
        print('✅ Webinar registration test completed successfully!')
    else:
        print('❌ Webinar registration test failed!')
        print('\n💡 Possible issues to check:')
        print('   - Zoom API credentials and permissions')
        print('   - Webinar registration settings in Zoom')
        print('   - Network connectivity to Zoom API')
        print('   - Student email address validity')