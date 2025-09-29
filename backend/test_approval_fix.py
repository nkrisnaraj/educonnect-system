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

from edu_admin.services import check_and_approve_paid_registrations

def test_approval_fix():
    """Test the fixed approval system"""
    print("🔧 Testing approval system with PUT method fix...")
    
    try:
        # Try to approve paid registrations
        total_approved = check_and_approve_paid_registrations()
        print(f"✅ Approval test completed. Total approved: {total_approved}")
        return True
    except Exception as e:
        print(f"❌ Approval test failed: {e}")
        return False

if __name__ == "__main__":
    test_approval_fix()