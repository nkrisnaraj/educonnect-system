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

from edu_admin.zoom_api import ZoomAPIClient

def test_real_approval():
    """Test approving the actual pending registrant"""
    print("🔧 Testing real registrant approval...")
    
    try:
        zoom_client = ZoomAPIClient('zoom1')
        webinar_id = "89714995008"  # Test class 7
        
        # Get pending registrants
        print(f"🔍 Getting pending registrants for webinar {webinar_id}...")
        pending = zoom_client.get_webinar_registrants(webinar_id, status="pending")
        
        registrants = pending.get('registrants', [])
        print(f"📊 Found {len(registrants)} pending registrants")
        
        if registrants:
            registrant = registrants[0]
            registrant_id = registrant.get('id')
            registrant_email = registrant.get('email')
            
            print(f"👤 First registrant: {registrant_email} (ID: {registrant_id})")
            
            # Try to approve this registrant
            print(f"🔄 Attempting to approve {registrant_email}...")
            result = zoom_client.update_registrant_status(
                webinar_id=webinar_id,
                registrant_id=registrant_id,
                action="approve"
            )
            
            print(f"✅ SUCCESS! Approved {registrant_email}")
            print(f"📄 Result: {result}")
            
            # Verify approval by checking approved registrants
            print("🔍 Verifying approval...")
            approved = zoom_client.get_webinar_registrants(webinar_id, status="approved")
            approved_emails = [r.get('email') for r in approved.get('registrants', [])]
            
            if registrant_email in approved_emails:
                print(f"✅ CONFIRMED: {registrant_email} is now in approved list")
            else:
                print(f"⚠️ {registrant_email} not found in approved list yet (may take time)")
                
        else:
            print("❌ No pending registrants found to test with")
            
    except Exception as e:
        print(f"❌ Error testing approval: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_real_approval()