from rest_framework import serializers
from .models import Payment, OnlinePayment, ReceiptPayment, Enrollment
from django.contrib.auth import get_user_model #Django's built-in auth system.
from .models import CalendarEvent  # Importing calendarEvent model
User = get_user_model()


class OnlinePaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnlinePayment
        fields = ['onlinepayid', 'payid', 'invoice_no', 'verified']

class ReceiptPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReceiptPayment
        fields = ['receiptid', 'payid', 'image_url', 'verified', 'uploaded_at']

class PaymentSerializer(serializers.ModelSerializer):
    online_payment = OnlinePaymentSerializer(source='onlinepayment', read_only=True)
    receipt_payment = ReceiptPaymentSerializer(source='receiptpayment', read_only=True)

    class Meta:
        model = Payment
        fields = ['payid', 'method', 'amount', 'date', 'status', 'online_payment', 'receipt_payment']

from instructor.serializers import ClassSerializer

class EnrollmentSerializer(serializers.ModelSerializer):
    classid = ClassSerializer(read_only=True)
    payid = PaymentSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = ['enrollid', 'classid', 'timestamp', 'payid']

from rest_framework import serializers
from .models import CalendarEvent

class CalendarEventSerializer(serializers.ModelSerializer):
    class_title = serializers.CharField(source='classid.title', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = CalendarEvent
        fields = [
            'id','title','description','event_type','date','time','created_by','created_by_username','classid','class_title','created_at','updated_at',
        ]

