#!/usr/bin/env python
"""
Diagnostic script to test messaging functionality
"""
import os
import sys
import django

# Add the project root to Python path
sys.path.append('/path/to/your/project')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from students.models import Message, ChatRoom
from accounts.models import User

def test_message_flow():
    print("=== MESSAGING SYSTEM DIAGNOSTIC ===\n")
    
    # Check if models exist and are accessible
    print("1. Checking Models...")
    try:
        print(f"   - Message model: {Message}")
        print(f"   - ChatRoom model: {ChatRoom}")
        print("   ✅ Models accessible")
    except Exception as e:
        print(f"   ❌ Model error: {e}")
        return

    # Check message count
    print(f"\n2. Current Message Count: {Message.objects.count()}")
    print(f"   Current ChatRoom Count: {ChatRoom.objects.count()}")
    
    # Check recent messages
    print(f"\n3. Recent Messages (last 5):")
    recent_messages = Message.objects.all().order_by('-created_at')[:5]
    for msg in recent_messages:
        print(f"   - ID: {msg.id}, Sender: {msg.sender}, Content: {msg.content[:50]}...")
        print(f"     Room: {msg.chat_room}, Delivered: {msg.is_delivered}, Read: {msg.is_seen}")
    
    # Check chat rooms
    print(f"\n4. Chat Rooms:")
    rooms = ChatRoom.objects.all()
    for room in rooms:
        msg_count = Message.objects.filter(chat_room=room).count()
        print(f"   - Room: {room.name}, Created by: {room.created_by}, Messages: {msg_count}")
    
    # Check users
    print(f"\n5. User Counts:")
    print(f"   - Total Users: {User.objects.count()}")
    print(f"   - Students: {User.objects.filter(role='student').count()}")
    print(f"   - Instructors: {User.objects.filter(role='instructor').count()}")
    print(f"   - Admins: {User.objects.filter(role='admin').count()}")

if __name__ == "__main__":
    test_message_flow()
