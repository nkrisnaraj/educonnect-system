#!/usr/bin/env python
"""
Find an active (future) webinar and associate Test Payment Class with it
"""
import os
import sys
import django
from datetime import datetime

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from edu_admin.models import ZoomWebinar
from edu_admin.zoom_api import ZoomAPIClient
from instructor.models import Class

def find_active_webinar_and_fix_association():
    """Find an active webinar and fix Test Payment Class association"""
    try:
        print('🔍 Finding Active Webinars')
        print('=' * 50)
        
        # Get Zoom client
        zoom_client = ZoomAPIClient('zoom1')
        
        # List webinars from Zoom
        print('📡 Fetching webinars from Zoom API...')
        webinars_data = zoom_client.list_webinars()
        webinars = webinars_data.get("webinars", [])
        
        now = datetime.now()
        print(f'🕐 Current time: {now}')
        
        active_webinars = []
        print(f'\n🎥 Checking {len(webinars)} webinars for active ones:')
        
        for webinar in webinars:
            webinar_id = str(webinar.get("id"))
            topic = webinar.get("topic")
            
            try:
                # Get detailed info to check start time
                detail = zoom_client.get_webinar_detail(webinar_id)
                start_time_str = detail.get("start_time")
                
                if start_time_str:
                    # Parse the start time (Zoom format: 2023-12-25T10:00:00Z)
                    start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
                    
                    # Convert to local time (rough comparison)
                    if start_time > now:
                        active_webinars.append({
                            'id': webinar_id,
                            'topic': topic,
                            'start_time': start_time,
                            'detail': detail
                        })
                        print(f'   ✅ {topic} (ID: {webinar_id}) - Starts: {start_time}')
                    else:
                        print(f'   ❌ {topic} (ID: {webinar_id}) - Already ended: {start_time}')
                else:
                    print(f'   ⚠️  {topic} (ID: {webinar_id}) - No start time')
                    
            except Exception as e:
                print(f'   ❌ {topic} (ID: {webinar_id}) - Error: {e}')
                
        if not active_webinars:
            print('\n❌ No active (future) webinars found!')
            print('\n💡 Let me create a new test webinar...')
            
            # Create a new test webinar
            from datetime import timedelta
            future_time = (now + timedelta(days=1)).strftime('%Y-%m-%dT%H:%M:%SZ')
            
            print(f'🆕 Creating new test webinar for {future_time}...')
            
            new_webinar = zoom_client.create_webinar(
                topic="Test Payment Class Webinar",
                start_time=future_time,
                duration=60,
                agenda="Test webinar for payment class registration testing"
            )
            
            webinar_id = str(new_webinar.get("id"))
            print(f'✅ Created new webinar: {new_webinar.get("topic")} (ID: {webinar_id})')
            
            # Create database record
            zoom_webinar_obj = ZoomWebinar.objects.create(
                webinar_id=webinar_id,
                account_key='zoom1',
                topic=new_webinar.get("topic"),
                registration_url=f"https://zoom.us/webinar/register/{webinar_id}",
                start_time=future_time,
                duration=new_webinar.get("duration"),
                agenda=new_webinar.get("agenda", "")
            )
            
        else:
            # Use the first active webinar
            selected = active_webinars[0]
            webinar_id = selected['id']
            
            print(f'\n🎯 Selected active webinar: {selected["topic"]} (ID: {webinar_id})')
            
            # Check if this webinar exists in our database
            zoom_webinar_obj = ZoomWebinar.objects.filter(webinar_id=webinar_id).first()
            
            if not zoom_webinar_obj:
                print('📝 Creating webinar record in database...')
                zoom_webinar_obj = ZoomWebinar.objects.create(
                    webinar_id=webinar_id,
                    account_key='zoom1',
                    topic=selected['detail'].get("topic"),
                    registration_url=f"https://zoom.us/webinar/register/{webinar_id}",
                    start_time=selected['detail'].get("start_time"),
                    duration=selected['detail'].get("duration"),
                    agenda=selected['detail'].get("agenda", "")
                )
                print(f'✅ Created webinar record: {zoom_webinar_obj.topic}')
            else:
                print(f'✅ Webinar already exists in database: {zoom_webinar_obj.topic}')
                
        # Update Test Payment Class to use this active webinar
        test_class = Class.objects.filter(title='Test Payment Class').first()
        if test_class:
            print(f'\n🔄 Updating Test Payment Class association...')
            print(f'   From: {test_class.webinar}')
            test_class.webinar = zoom_webinar_obj
            test_class.save()
            print(f'   To: {test_class.webinar}')
            print(f'✅ Test Payment Class now associated with active webinar!')
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
    success = find_active_webinar_and_fix_association()
    
    if success:
        print('\n✅ Successfully associated Test Payment Class with active webinar!')
        print('Now test the payment verification flow - it should register students for the active webinar.')
    else:
        print('\n❌ Failed to fix webinar association!')