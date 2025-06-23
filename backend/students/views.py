from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Payment, OnlinePayment, ReceiptPayment, Enrollment
import uuid
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse
from django.contrib.auth import get_user_model
from .serializers import ReceiptPaymentSerializer
import re
import pytesseract
from PIL import Image
from io import BytesIO
from instructor.models import Course

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
User = get_user_model()

@method_decorator(csrf_exempt, name='dispatch')
class PayHereNotifyView(APIView):
    """
    Called by PayHere when payment is completed (success/fail).
    It updates OnlinePayment status accordingly.
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request, *args, **kwargs):
        try:
            order_id = request.data.get('order_id')  # This is CLASS-COURSEID-USERID
            status_code = request.data.get('status_code')  # '2' = success
            payhere_amount = request.data.get('payhere_amount')
            

            print("Received from PayHere Data:", request.data)

            if status_code == '2' :
                payment_status = 'success'
            elif status_code == '1' :
                payment_status = 'fail'
            else :
                payment_status = "pending"

            if not order_id or not status_code:
                return Response({"error": "Missing required fields"}, status=400)
            
            

            # Extract payment using order_id
            parts = order_id.split('-')
            if len(parts) != 3:
                return Response({"error": "Invalid order_id format"}, status=400)

            course_id = int(parts[1])
            user_id = int(parts[2])
            user = User.objects.get(id=user_id)

            

            # Get latest payment by user with "pending" status
            payment = Payment.objects.filter(stuid=user, method='online',status='pending',amount=payhere_amount).order_by('-date').first()

            if not payment:
                return Response({"error": "Payment not found"}, status=404)

            payment.status = payment_status
            payment.save()

            online_payment = OnlinePayment.objects.get(payid=payment)
            online_payment.verified = payment_status
            online_payment.save()

            if payment_status == "success":
                Enrollment.objects.create(
                    stuid = user,
                    courseid = course_id,
                    payid = payment
                )

            return HttpResponse("Payment notification processed successfully.", status=200)
        
            
        
        except Exception as e:
            print("Notify error:", e)
            return Response({"error": str(e)}, status=400)




class OnlinePaymentView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request) :
        print("User in request:", request.user)
        print("Is authenticated:", request.user.is_authenticated)
        print("User in request:", request.user)
        if not request.user.is_authenticated:
            return Response({"error": "User not authenticated"}, status=401)
        user = request.user
        amount = request.data.get("amount")

        try:
            #create Payment record
            payment = Payment.objects.create(
                stuid = user,
                method="online",
                amount=amount,
                
            )

            #Create onlinePayment record
            invoice_no = f"INV-{uuid.uuid4().hex[:8].upper()}"
            online_payment = OnlinePayment.objects.create(
                payid=payment,
                invoice_no=invoice_no,
                status=""
            )
            return Response({
                "payid": payment.payid,
                "invoice_no": invoice_no,
                "amount": amount
            },status=status.HTTP_201_CREATED)
        
        except Exception as e:
             return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)






