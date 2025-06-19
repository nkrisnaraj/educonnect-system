from rest_framework import serializers
from .models import Payment, OnlinePayment, ReceiptPayment
from django.contrib.auth import get_user_model #Django's built-in auth system.

User = get_user_model()

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['payid', 'stuid','method','amount','date']  #fields to include in the serialized output or input:

class OnlinePaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnlinePayment
        fields = ['onlinepayid', 'payid', 'invoice_no', 'status']

class ReceiptPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReceiptPayment
        fields = ['receiptid', 'payid', 'image_url', 'verified', 'uploaded_at']
