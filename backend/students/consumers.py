from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .models import Message
from django.contrib.auth import get_user_model
User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

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
