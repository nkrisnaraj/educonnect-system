from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json
from .models import Message, ChatRoom
from django.contrib.auth import get_user_model
User = get_user_model()

class AdminChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.student_id = self.scope['url_route']['kwargs']['student_id']
        self.room_name = f"admin_chat_{self.student_id}"
        self.room_group_name = f"chat_{self.room_name}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        sender_type = data.get('sender_type', 'admin')

        # Get student and admin users
        student = await database_sync_to_async(User.objects.get)(id=self.student_id)
        admin_user = self.scope["user"]

        # Determine sender and receiver
        if sender_type == 'admin':
            sender = admin_user
            receiver = student
        else:
            sender = student
            receiver = admin_user

        # Save message in DB
        msg = await self.save_message(sender, receiver, message)

        # Send message to WebSocket group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender_id': sender.id,
                'receiver_id': receiver.id,
                'timestamp': str(msg.created_at),
                'sender_type': sender_type,
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat',
            'message': event['message'],
            'sender_id': event['sender_id'],
            'receiver_id': event['receiver_id'],
            'timestamp': event['timestamp'],
            'sender_type': event.get('sender_type', 'student'),
        }))

    @database_sync_to_async
    def save_message(self, sender, receiver, message):
        # Get or create chat room for admin chat
        chat_room, created = ChatRoom.objects.get_or_create(
            created_by=receiver if sender.role == 'admin' else sender,
            name='admin'
        )
        
        # Save message
        return Message.objects.create(
            chat_room=chat_room, 
            sender=sender, 
            content=message
        )

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.sender_id = self.scope['url_route']['kwargs']['sender_id']
        self.receiver_id = self.scope['url_route']['kwargs']['receiver_id']

        # Create a consistent group name for both users
        self.room_name = f"chat_{min(self.sender_id, self.receiver_id)}_{max(self.sender_id, self.receiver_id)}"
        self.room_group_name = f"chat_{self.room_name}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']

        sender_id = int(self.sender_id)
        receiver_id = int(self.receiver_id)

        sender = await database_sync_to_async(User.objects.get)(id=sender_id)
        receiver = await database_sync_to_async(User.objects.get)(id=receiver_id)

        # Save message in DB
        msg = await self.save_message(sender, receiver, message)

        # Send message to WebSocket group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender_id': sender_id,
                'receiver_id': receiver_id,
                'timestamp': str(msg.created_at),
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat',
            'message': event['message'],
            'sender_id': event['sender_id'],
            'receiver_id': event['receiver_id'],
            'timestamp': event['timestamp'],
        }))

    @database_sync_to_async
    def save_message(self, sender, receiver, message):
        # Create/get room
        room_name = f"chat_{min(sender.id, receiver.id)}_{max(sender.id, receiver.id)}"
        chat_room, created = ChatRoom.objects.get_or_create(name=room_name, defaults={'created_by': sender})

        # Save message
        return Message.objects.create(chat_room=chat_room, sender=sender, content=message)




        # Auto-mark messages as delivered when receiver connects
        receiver = self.scope['user']
        await self.mark_messages_delivered(receiver)

    async def mark_messages_delivered(self, receiver):
        unread = await database_sync_to_async(
            lambda: Message.objects.filter(receiver=receiver, is_delivered=False)
        )()
        for msg in unread:
            msg.is_delivered = True
            msg.save()

        # Optionally broadcast updated status
        for msg in unread:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'message_status',
                    'message_id': msg.id,
                    'status': 'delivered'
                }
            )

    async def receive(self, text_data):
        data = json.loads(text_data)

        if data['type'] == 'message':
            # handle sending message
            ...
        elif data['type'] == 'mark_seen':
            await self.mark_message_seen(data['message_ids'])

    async def mark_message_seen(self, ids):
        for id in ids:
            msg = await database_sync_to_async(lambda: Message.objects.get(id=id))()
            msg.is_seen = True
            msg.save()

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'message_status',
                    'message_id': msg.id,
                    'status': 'seen'
                }
            )

    async def message_status(self, event):
        await self.send(text_data=json.dumps({
            'type': 'status_update',
            'message_id': event['message_id'],
            'status': event['status']
        }))
