import json
import re
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Payment, OnlinePayment, ReceiptPayment, Enrollment, StudentProfile
import uuid
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse
from django.contrib.auth import get_user_model
from .serializers import ReceiptPaymentSerializer
from accounts.serializers import StudentProfileSerializer
from google.cloud import vision
import hashlib
from django.conf import settings
from django.db import IntegrityError
from .utils.google_creds import setup_google_credentials  # Utility function to setup Google API creds

# Initialize Google Cloud credentials once when module loads
setup_google_credentials()

User = get_user_model()  # Get the User model used by Django project

merchant_id = settings.PAYHERE_MERCHANT_ID
merchant_secret = settings.PAYHERE_MERCHANT_SECRET

class OnlinePaymentView(APIView):
    """
    API view to handle creation of online payment records
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Check if user is authenticated (redundant with permission but explicit here)
        if not request.user.is_authenticated:
            return Response({"error": "User not authenticated"}, status=401)

        user = request.user
        amount = request.data.get("amount")

        try:
            # Create a new Payment object with method='online'
            payment = Payment.objects.create(
                stuid=user,
                method="online",
                amount=amount,
            )

            # Generate a unique invoice number
            invoice_no = f"INV-{uuid.uuid4().hex[:8].upper()}"

            # Create associated OnlinePayment record with generated invoice number
            online_payment = OnlinePayment.objects.create(
                payid=payment,
                invoice_no=invoice_no,
                status=""
            )
            # Return created payment info
            return Response({
                "payid": payment.payid,
                "invoice_no": invoice_no,
                "amount": amount
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            # Return error if anything goes wrong
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ReceiptUploadView(APIView):
    """
    API view to upload receipt images and process them with Google Vision OCR
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # Support multipart/form-data for file upload

    def post(self, request):
        user = request.user
        image = request.FILES.get("image")
        method = 'receipt'

        if not image:
            # No image file was sent in the request
            return Response({'error': "No image provided"}, status=400)

        # Create initial Payment record with zero amount (to be updated after OCR)
        payment = Payment.objects.create(stuid=user, method=method, amount=0.0)

        # Initialize Google Vision API client
        client = vision.ImageAnnotatorClient()

        # Read image content from uploaded file
        image_content = image.read()
        vision_image = vision.Image(content=image_content)

        # Use Google Vision API to detect text in image
        response = client.text_detection(image=vision_image)

        # If no text detected, return a message to re-upload
        if not response.text_annotations:
            return Response({'message': "Image not clear. Please re-upload a clearer receipt."}, status=200)

        # Extract full text from first annotation
        full_text = response.text_annotations[0].description

        # Use regex to find amount in text (like Rs. 1250.00 or 1,250.00)
        amount_match = re.search(r'(Rs\.?|LKR)?\s*([\d,]+(?:\.\d{2})?)', full_text)
        amount = float(amount_match.group(2).replace(',', '')) if amount_match else 0.0
        payment.amount = amount
        payment.save()  # Update payment amount in DB

        # Extract transaction ID from text (e.g., "Transaction ID: ABC123")
        transaction_id_match = re.search(r'Transaction ID[:\- ]+(\w+)', full_text)
        transaction_id = transaction_id_match.group(1) if transaction_id_match else None

        try:
            # Save ReceiptPayment with image and extracted transaction ID, initially not verified
            receipt_payment = ReceiptPayment.objects.create(
                payid=payment,
                image_url=image,
                transaction_id=transaction_id,
                verified=False
            )
        except IntegrityError:
            # Likely due to duplicate transaction ID constraint
            return Response({'error': 'Duplicate or invalid transaction ID. Please upload a different receipt.'}, status=400)

        # Serialize and return saved receipt payment details
        serializer = ReceiptPaymentSerializer(receipt_payment)
        return Response({
            "message": "Successfully saved details. After verification, you can enroll in class.",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)


class PaymentInfoView(APIView):
    """
    API view to fetch all payments of the authenticated user with related details
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        payments = Payment.objects.filter(stuid=user)

        payment_list = []

        for payment in payments:
            # Try to get Enrollment related to this payment
            enrollment = Enrollment.objects.filter(payid=payment).first()
            coursename = enrollment.courseid.title if enrollment else None

            invoice_no = None
            transaction_id = None

            # Get invoice or transaction depending on payment method
            if payment.method == 'online':
                try:
                    online_payment = OnlinePayment.objects.get(payid=payment)
                    invoice_no = online_payment.invoice_no
                except OnlinePayment.DoesNotExist:
                    invoice_no = None

            elif payment.method == 'receipt':
                try:
                    receipt_payment = ReceiptPayment.objects.get(payid=payment)
                    transaction_id = receipt_payment.transaction_id
                except ReceiptPayment.DoesNotExist:
                    transaction_id = None

            # Append payment details to list
            payment_list.append({
                "payid": payment.payid,
                "date": payment.date.strftime('%Y-%m-%d'),
                "amount": float(payment.amount),
                "status": payment.status,
                "method": payment.method,
                "course": coursename,
                "Invoice_No": invoice_no,
                "Transaction": transaction_id
            })

        return Response({"payments": payment_list})


class StudentProfileView(APIView):
    """
    API view to get student profile details of authenticated user
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # Only allow users with 'student' role to access
        if user.role != "student":
            return Response({"error": "Only Students allowed"}, status=403)

        profile = user.student_profile
        serializer = StudentProfileSerializer(profile)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    user = request.user
    data = request.data
    order_id = data.get('order_id')
    amount = data.get('amount')
    currency = data.get('currency')
    course_ids = data.get('course_ids')
    course_summary = data.get('items', '')

    if not all([order_id, amount, currency, course_ids]):
        return Response({'error': 'Missing data'}, status=400)

    # Create Payment record
    payment = Payment.objects.create(
        stuid=user,
        method='online',
        amount=amount,
        status='pending',
    )

    OnlinePayment.objects.create(
        payid=payment,
        invoice_no=payment.payid,
        course_ids=course_ids,
        course_summary=course_summary,
    )

    merchant_id = settings.PAYHERE_MERCHANT_ID
    merchant_secret = settings.PAYHERE_MERCHANT_SECRET

    # Correct hash generation
    hash_secret = hashlib.md5(merchant_secret.encode("utf-8")).hexdigest().upper()
    hash_data = f"{merchant_id}{order_id}{amount}{currency}{hash_secret}"
    hash_ = hashlib.md5(hash_data.encode("utf-8")).hexdigest().upper()

    return Response({
        'merchant_id': merchant_id,
        'hash': hash_,
        'order_id': order_id,
    })



@csrf_exempt
@api_view(['POST'])
def payment_notify(request):
    """
    Webhook endpoint called by PayHere to notify payment status
    """
    data = request.data
    order_id = data.get('order_id')
    amount = data.get('payhere_amount')
    currency = data.get('payhere_currency')
    status_code = data.get('status_code')
    received_sig = data.get('md5sig')

    merchant_id = settings.PAYHERE_MERCHANT_ID
    merchant_secret = settings.PAYHERE_MERCHANT_SECRET

    # Create expected signature hash to verify authenticity
    hash_string = f"{merchant_id}{order_id}{amount}{currency}{status_code}{hashlib.md5(merchant_secret.encode()).hexdigest().upper()}"
    expected_sig = hashlib.md5(hash_string.encode()).hexdigest().upper()

    # Verify signature and status_code (2 = success)
    if received_sig == expected_sig and status_code == '2':
        try:
            payment = Payment.objects.get(order_id=order_id)
            payment.status = 'success'
            payment.save()

            # Mark OnlinePayment as verified
            online = OnlinePayment.objects.get(payid=payment)
            online.verified = True
            online.save()

            # Get student profile linked to user
            student_profile = StudentProfile.objects.get(user=payment.stuid)

            # Enroll student to all classes in the payment's course_ids
            for class_id in online.course_ids:
                Enrollment.objects.create(
                    stuid=student_profile,
                    classid_id=class_id,
                    payid=payment
                )

            return Response("Payment verified and student enrolled", status=200)
        except Payment.DoesNotExist:
            return Response("Payment not found", status=404)

    # Return error if signature invalid or status_code not success
    return Response("Invalid signature", status=400)



'''
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    try:
        user = request.user
        print(f"DEBUG: Received payment request from {user}")


        data = request.data
        order_id = data.get("order_id")
        amount = data.get("amount")
        currency = data.get("currency")


        merchant_id = settings.PAYHERE_MERCHANT_ID
        merchant_secret = settings.PAYHERE_MERCHANT_SECRET


        # Validate fields
        if not all([order_id, amount, currency]):
            return Response({"error": "Missing payment fields"}, status=400)


        # ✅ Save payment to DB (status = pending)

        # ✅ Generate hash
        hash_secret = hashlib.md5(merchant_secret.encode("utf-8")).hexdigest().upper()
        hash_data = f"{merchant_id}{order_id}{amount}{currency}{hash_secret}"
        hash_ = hashlib.md5(hash_data.encode("utf-8")).hexdigest().upper()


        return Response({
            "merchant_id": merchant_id,
            "hash": hash_
        })


    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

'''

