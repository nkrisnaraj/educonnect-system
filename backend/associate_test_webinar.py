#!/usr/bin/env python
"""
Script to associate Test Payment Class with Test Webinar
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
from edu_admin.models import ZoomWebinar

def associate_test_class_webinar():
    """Associate Test Payment Class with Test Webinar"""
    try:
        # Find the Test Payment Class and Test Webinar
        test_class = Class.objects.filter(title='Test Payment Class').first()
        test_webinar = ZoomWebinar.objects.filter(topic='Test Webinar').first()

        if test_class and test_webinar:
            print(f'🔗 Associating class "{test_class.title}" with webinar "{test_webinar.topic}"')
            test_class.webinar = test_webinar
            test_class.save()
            print(f'✅ Successfully associated! Class now has webinar: {test_class.webinar}')
            
            # Verify the association
            test_class.refresh_from_db()
            print(f'🔍 Verification - Class webinar: {test_class.webinar}')
            return True
        else:
            print(f'❌ Missing components:')
            print(f'   - Class found: {bool(test_class)}')
            print(f'   - Webinar found: {bool(test_webinar)}')
            return False
            
    except Exception as e:
        print(f'❌ Error associating class with webinar: {e}')
        return False

if __name__ == '__main__':
    print('🚀 Starting Test Class-Webinar Association')
    print('=' * 50)
    
    success = associate_test_class_webinar()
    
    if success:
        print('\n✅ Association completed successfully!')
        print('Now when students enroll in "Test Payment Class", they will be automatically registered for the "Test Webinar"')
    else:
        print('\n❌ Association failed!')