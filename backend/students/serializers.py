from rest_framework import serializers
from .models import Payment, OnlinePayment, ReceiptPayment, Enrollment
from django.contrib.auth import get_user_model #Django's built-in auth system.
from .models import CalendarEvent 
from .models import ChatRoom, Message 
from .models import CalendarEvent

User = get_user_model()


# class OnlinePaymentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = OnlinePayment
#         fields = ['onlinepayid', 'payid', 'invoice_no', 'verified']

# class ReceiptPaymentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ReceiptPayment
#         fields = ['receiptid', 'payid', 'image_url', 'verified', 'uploaded_at']

# class PaymentSerializer(serializers.ModelSerializer):
#     online_payment = OnlinePaymentSerializer(source='onlinepayment', read_only=True)
#     receipt_payment = ReceiptPaymentSerializer(source='receiptpayment', read_only=True)

#     class Meta:
#         model = Payment
#         fields = ['payid', 'method', 'amount', 'date', 'status', 'online_payment', 'receipt_payment']

from rest_framework import serializers
from .models import Payment, OnlinePayment, ReceiptPayment
from django.contrib.auth import get_user_model
from students.models import StudentProfile

User = get_user_model()

class OnlinePaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnlinePayment
        fields = ['onlinepayid', 'invoice_no', 'verified']

class ReceiptPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReceiptPayment
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    online_payment = OnlinePaymentSerializer(source='onlinepayment', read_only=True)
    receipt_payment = ReceiptPaymentSerializer(source='receiptpayment', read_only=True)

    studentName = serializers.SerializerMethodField()
    studentId = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'payid', 'method', 'amount', 'date', 'status',
            'online_payment', 'receipt_payment',
            'studentName', 'studentId'
        ]

    def get_studentName(self, obj):
        try:
            return obj.stuid.get_full_name()
        except:
            return obj.stuid.username

    def get_studentId(self, obj):
        try:
            return obj.stuid.student_profile.stuid
        except:
            return None


from instructor.serializers import ClassSerializer

class EnrollmentSerializer(serializers.ModelSerializer):
    classid = ClassSerializer(read_only=True)
    payid = PaymentSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = ['enrollid', 'classid', 'timestamp', 'payid']



class ChatRoomSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'created_by', 'created_by_name', 'created_at', 'updated_at', 'is_active', 'room_type']

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    message = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ['id', 'chat_room', 'sender', 'message', 'content', 'created_at', 'is_delivered', 'is_seen']  # Include both message and content
    
    def get_sender(self, obj):
        if obj.sender:
            return {
                'id': obj.sender.id,
                'username': obj.sender.username,
                'first_name': obj.sender.first_name,
                'last_name': obj.sender.last_name,
            }
        return None
    
    def get_message(self, obj):
        # Return the actual content from the model
        return getattr(obj, 'content', '') or getattr(obj, 'message', '') or ''



class CalendarEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarEvent
        fields = ['id','title','type','date','color']


from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['note_id','student_id','title','message','type','read_status','created_at']
