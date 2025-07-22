from rest_framework import serializers
from .models import Payment, OnlinePayment, ReceiptPayment, Enrollment
from django.contrib.auth import get_user_model #Django's built-in auth system.
from .models import CalendarEvent 
from .models import ChatRoom, Message
from accounts.serializers import UserSerializer  
from .models import CalendarEvent

User = get_user_model()

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['payid', 'stuid','method','amount','date','status']  #fields to include in the serialized output or input:

class OnlinePaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnlinePayment
        fields = ['onlinepayid', 'payid', 'invoice_no', 'verified']

class ReceiptPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReceiptPayment
        fields = ['receiptid', 'payid', 'image_url', 'verified', 'uploaded_at']

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ['enrollid', 'stuid' , 'classid', 'payid','timestamp']



class ChatRoomSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    receiver_name = serializers.CharField(source='receiver.username', read_only=True)

    class Meta:
        model = ChatRoom
        fields = ['id', 'sender', 'sender_name', 'receiver', 'receiver_name', 'message', 'timestamp']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)  # Nested sender info

    class Meta:
        model = Message
        fields = ['id', 'chat_room', 'sender', 'message', 'created_at', 'read_status']
        read_only_fields = ['created_at', 'read_status']



class CalendarEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarEvent
        fields = ['id','title','type','date','color']
