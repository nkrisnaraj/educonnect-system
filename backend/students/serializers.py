from rest_framework import serializers
from .models import Payment, OnlinePayment, ReceiptPayment, Enrollment
from django.contrib.auth import get_user_model #Django's built-in auth system.
from .models import CalendarEvent  # Importing calendarEvent model
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

