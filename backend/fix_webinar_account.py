#!/usr/bin/env python
"""
Fix Test Webinar account key to use valid zoom1 account
"""
import os
import sys
import django

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from edu_admin.models import ZoomWebinar

def fix_test_webinar_account_key():
    """Fix Test Webinar to use valid zoom1 account key"""
    try:
        print('🔧 Fixing Test Webinar Account Key')
        print('=' * 50)
        
        # Find Test Webinar
        test_webinar = ZoomWebinar.objects.filter(topic='Test Webinar').first()
        if not test_webinar:
            print('❌ Test Webinar not found')
            return False
            
        print(f'📝 Found Test Webinar:')
        print(f'   Topic: {test_webinar.topic}')
        print(f'   Current account_key: {test_webinar.account_key}')
        print(f'   Webinar ID: {test_webinar.webinar_id}')
        
        # Update to use zoom1 account key
        test_webinar.account_key = 'zoom1'
        test_webinar.save()
        
        print(f'\n✅ Updated Test Webinar account_key to: zoom1')
        
        # Verify the change
        test_webinar.refresh_from_db()
        print(f'🔍 Verification - account_key is now: {test_webinar.account_key}')
        
        return True
        
    except Exception as e:
        print(f'❌ Error fixing account key: {e}')
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = fix_test_webinar_account_key()
    
    if success:
        print('\n✅ Test Webinar account key fixed successfully!')
        print('Now the webinar registration should work with the zoom1 account.')
    else:
        print('\n❌ Failed to fix Test Webinar account key!')