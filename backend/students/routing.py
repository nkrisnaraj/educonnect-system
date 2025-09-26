# This routing file defines the WebSocket URL patterns for the chat application.

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<student_id>\d+)/admin/$', consumers.AdminChatConsumer.as_asgi()),
    re_path(r'ws/chat/(?P<sender_id>\d+)/(?P<receiver_id>\d+)/$', consumers.ChatConsumer.as_asgi()),
]

