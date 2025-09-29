#!/usr/bin/env python
"""
Debug script to check webinar associations with classes
"""

import os
import sys
import django

# Add the project root to Python path
sys.path.append(os.path.join(os.path.dirname(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from instructor.models import Class
from edu_admin.models import ZoomWebinar
from students.models import Payment

def check_webinar_associations():
    """Check which classes have webinars and which payments are recent"""
    print("🔍 Checking Class-Webinar Associations")
    print("=" * 50)
    
    classes = Class.objects.all()
    print(f"📚 Total Classes: {classes.count()}")
    
    classes_with_webinars = 0
    classes_without_webinars = 0
    
    for class_obj in classes:
        if class_obj.webinar:
            classes_with_webinars += 1
            print(f"✅ {class_obj.title} → Webinar: {class_obj.webinar.topic}")
        else:
            classes_without_webinars += 1
            print(f"❌ {class_obj.title} → No webinar")
    
    print(f"\n📊 Summary:")
    print(f"   - Classes with webinars: {classes_with_webinars}")
    print(f"   - Classes without webinars: {classes_without_webinars}")
    
    print(f"\n🎥 All Webinars:")
    webinars = ZoomWebinar.objects.all()
    for webinar in webinars:
        print(f"   - {webinar.topic} (ID: {webinar.webinar_id})")
    
    print(f"\n💳 Recent Payments:")
    recent_payments = Payment.objects.filter(status='success').order_by('-date')[:5]
    for payment in recent_payments:
        print(f"   - {payment.stuid.username}: {payment.class_names} (Status: {payment.status})")

if __name__ == '__main__':
    check_webinar_associations()