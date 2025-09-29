#!/usr/bin/env python
"""
List real webinars from Zoom and associate Test Payment Class with a real one
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
from edu_admin.zoom_api import ZoomAPIClient
from instructor.models import Class

def list_real_webinars_and_fix_association():
    """List real webinars from Zoom and fix Test Payment Class association"""
    try:
        print('🔍 Listing Real Webinars from Zoom')
        print('=' * 50)
        
        # Get Zoom client
        zoom_client = ZoomAPIClient('zoom1')
        
        # List webinars from Zoom
        print('📡 Fetching webinars from Zoom API...')
        webinars_data = zoom_client.list_webinars()
        webinars = webinars_data.get("webinars", [])
        
        print(f'\n🎥 Found {len(webinars)} webinars in Zoom:')
        for webinar in webinars:
            print(f'   - {webinar.get("topic")} (ID: {webinar.get("id")})')
            
        if not webinars:
            print('❌ No webinars found in Zoom account')
            return False
            
        # Find a suitable webinar (prefer one with "test" in the name)
        suitable_webinar = None
        for webinar in webinars:
            topic = webinar.get("topic", "").lower()
            if "test" in topic:
                suitable_webinar = webinar
                break
                
        # If no test webinar found, use the first one
        if not suitable_webinar and webinars:
            suitable_webinar = webinars[0]
            
        if not suitable_webinar:
            print('❌ No suitable webinar found')
            return False
            
        print(f'\n🎯 Selected webinar: {suitable_webinar.get("topic")} (ID: {suitable_webinar.get("id")})')
        
        # Check if this webinar exists in our database
        zoom_webinar_obj = ZoomWebinar.objects.filter(
            webinar_id=str(suitable_webinar.get("id"))
        ).first()
        
        if not zoom_webinar_obj:
            print('📝 Creating webinar record in database...')
            # Get detailed info
            detail = zoom_client.get_webinar_detail(str(suitable_webinar.get("id")))
            
            zoom_webinar_obj = ZoomWebinar.objects.create(
                webinar_id=str(suitable_webinar.get("id")),
                account_key='zoom1',
                topic=detail.get("topic"),
                registration_url=f"https://zoom.us/webinar/register/{suitable_webinar.get('id')}",
                start_time=detail.get("start_time"),
                duration=detail.get("duration"),
                agenda=detail.get("agenda", "")
            )
            print(f'✅ Created webinar record: {zoom_webinar_obj.topic}')
        else:
            print(f'✅ Webinar already exists in database: {zoom_webinar_obj.topic}')
            
        # Update Test Payment Class to use this real webinar
        test_class = Class.objects.filter(title='Test Payment Class').first()
        if test_class:
            print(f'\n🔄 Updating Test Payment Class association...')
            print(f'   From: {test_class.webinar}')
            test_class.webinar = zoom_webinar_obj
            test_class.save()
            print(f'   To: {test_class.webinar}')
            print(f'✅ Test Payment Class now associated with real webinar!')
        else:
            print('❌ Test Payment Class not found')
            return False
            
        return True
        
    except Exception as e:
        print(f'❌ Error: {e}')
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = list_real_webinars_and_fix_association()
    
    if success:
        print('\n✅ Successfully associated Test Payment Class with real webinar!')
        print('Now test the payment verification flow - it should register students for the actual Zoom webinar.')
    else:
        print('\n❌ Failed to fix webinar association!')