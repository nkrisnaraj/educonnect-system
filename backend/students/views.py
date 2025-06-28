import json
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
from google.cloud import vision
import pytesseract
from PIL import Image
from io import BytesIO
from instructor.models import Class
from accounts.serializers import StudentProfileSerializer
from google.cloud import vision
from django.db import IntegrityError
from google.oauth2 import service_account


User = get_user_model()


#payherenotify view
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
            order_id = request.data.get('order_id')  # Format: CLASS-COURSEID-USERID
            status_code = request.data.get('status')  # ⚠️ Use correct field name
            payhere_amount = request.data.get('payhere_amount')

            print("Received from PayHere Data:", request.data)

            if status_code == '2':
                payment_status = 'success'
            elif status_code == '1':
                payment_status = 'fail'
            else:
                payment_status = "pending"

            if not order_id or not status_code:
                return Response({"error": "Missing required fields"}, status=400)

            # Extract course_id and user_id
            parts = order_id.split('-')
            if len(parts) != 3:
                return Response({"error": "Invalid order_id format"}, status=400)

            course_id = int(parts[1])
            user_id = int(parts[2])
            user = User.objects.get(id=user_id)

            # Find corresponding Payment
            payment = Payment.objects.filter(
                stuid=user,
                method='online',
                status='pending',
                amount=payhere_amount
            ).order_by('-date').first()

            if not payment:
                return Response({"error": "Payment not found"}, status=404)

            payment.status = payment_status
            payment.save()

            online_payment = OnlinePayment.objects.get(payid=payment)
            online_payment.verified = payment_status
            online_payment.save()

            if payment_status == "success":
                Enrollment.objects.create(
                    stuid=user,
                    courseid=course_id,
                    payid=payment
                )

            return HttpResponse("Payment notification processed successfully.", status=200)

        except Exception as e:
            print("Notify error:", e)
            return Response({"error": str(e)}, status=400)  




#Online payment view
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



##ocr related
import os
import json
import tempfile
from dotenv import load_dotenv

load_dotenv()

creds_json_str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")

if creds_json_str:
    creds_json_str = creds_json_str.strip("'")
    
    try:
        creds_dict = json.loads(creds_json_str)
        print(creds_dict['private_key'])
        if "private_key" in creds_dict:
            creds_dict["private_key"] = creds_dict["private_key"].replace("\\n", "\n")
            print(creds_dict['private_key'])
        with tempfile.NamedTemporaryFile(mode='w+', delete=False, suffix='.json') as temp_file:
            json.dump(creds_dict, temp_file)
            temp_file_path = temp_file.name
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = temp_file_path
        print(f"✅ Google credentials written to temp file at: {temp_file_path}")
    except json.JSONDecodeError as e:
        print("❌ Error parsing GOOGLE_APPLICATION_CREDENTIALS_JSON:", e)

else:
    print("GOOGLE_APPLICATION_CREDENTIALS_JSON not set")

class ReceiptUploadView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        #print(os.path.exists(os.path.join(BASE_DIR, 'backend', 'vision-key.json')))

        user = request.user
        image = request.FILES.get("image")
        method = 'receipt'

        if not image:
            return Response({'error': "No image provided"}, status=400)

        #  Create payment with zero amount
        payment = Payment.objects.create(stuid=user, method=method, amount=0.0)

        #  Setup Google Vision client
        client = vision.ImageAnnotatorClient()
        

        #  Read uploaded image and send to Vision API
        image_content = image.read()
        vision_image = vision.Image(content=image_content)
        response = client.text_detection(image=vision_image)

        if not response.text_annotations:
            return Response({'message': "Image not clear. Please re-upload a clearer receipt."}, status=200)

        #  Extract text and parse details
        full_text = response.text_annotations[0].description
        print("GOOGLE OCR TEXT:\n", full_text)

        # Extract amount (e.g., Rs. 1250.00 or 1,250.00)
        amount_match = re.search(r'(Rs\.?|LKR)?\s*([\d,]+(?:\.\d{2})?)', full_text)
        amount = float(amount_match.group(2).replace(',', '')) if amount_match else 0.0
        payment.amount = amount
        payment.save()

        # Extract transaction ID (e.g., Transaction ID: ABC123)
        transaction_id_match = re.search(r'Transaction ID[:\- ]+(\w+)', full_text)
        transaction_id = transaction_id_match.group(1) if transaction_id_match else None

        # Step 5: Save receipt image + extracted info
        try:
            receipt_payment = ReceiptPayment.objects.create(
                payid=payment,
                image_url=image,
                transaction_id=transaction_id,
                verified=False
            )
        except IntegrityError as e:
            return Response({'error': 'Duplicate or invalid transaction ID. Please upload a different receipt.'}, status=400)

        serializer = ReceiptPaymentSerializer(receipt_payment)
        return Response({
            "message": "Successfully saved details. After verification, you can enroll in class.",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

# from azure.cognitiveservices.vision.computervision import ComputerVisionClient
# #from azure.cognitiveservices.vision.computervision.models import OperationStatusCodes
# from msrest.authentication import CognitiveServicesCredentials
# import io
# import os
# from dotenv import load_dotenv

# load_dotenv()

# AZURE_ENDPOINT = os.getenv('AZURE_OCR_ENDPOINT')
# AZURE_SUBSCRIPTION_KEY = os.getenv('AZURE_OCR_KEY')

# print("Endpoint:", AZURE_ENDPOINT)
# print("Subscription Key:", AZURE_SUBSCRIPTION_KEY)

# class ReceiptUploadView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]
#     parser_classes = [MultiPartParser, FormParser]

#     def post(self, request):
#         user = request.user
#         image = request.FILES.get("image")
#         method = 'receipt'

#         if not image:
#             return Response({'error': "No image provided"}, status=400)

#         # Create payment with zero amount
#         payment = Payment.objects.create(stuid=user, method=method, amount=0.0)

#         # Initialize Azure Computer Vision Client
#         client = ComputerVisionClient(
#             AZURE_ENDPOINT, 
#             CognitiveServicesCredentials(AZURE_SUBSCRIPTION_KEY)
#         )

#         # Read image bytes
#         image_content = image.read()

#         # Use Azure OCR to extract text from image
#         ocr_result = client.recognize_printed_text_in_stream(image=io.BytesIO(image_content))

#         # Collect all recognized lines into a single text
#         full_text = ""
#         for region in ocr_result.regions:
#             for line in region.lines:
#                 line_text = " ".join([word.text for word in line.words])
#                 full_text += line_text + "\n"

#         if not full_text.strip():
#             return Response({'message': "Image not clear. Please re-upload a clearer receipt."}, status=200)

#         print("AZURE OCR TEXT:\n", full_text)

#         # Extract amount (same as before)
#         amount_match = re.search(r'(Rs\.?|LKR)?\s*([\d,]+(?:\.\d{2})?)', full_text)
#         amount = float(amount_match.group(2).replace(',', '')) if amount_match else 0.0
#         payment.amount = amount
#         payment.save()

#         # Extract transaction ID (same as before)
#         transaction_id_match = re.search(r'Transaction ID[:\- ]+(\w+)', full_text)
#         transaction_id = transaction_id_match.group(1) if transaction_id_match else None

#         try:
#             receipt_payment = ReceiptPayment.objects.create(
#                 payid=payment,
#                 image_url=image,
#                 transaction_id=transaction_id,
#                 verified=False
#             )
#         except IntegrityError:
#             return Response({'error': 'Duplicate or invalid transaction ID. Please upload a different receipt.'}, status=400)

#         serializer = ReceiptPaymentSerializer(receipt_payment)
#         return Response({
#             "message": "Successfully saved details. After verification, you can enroll in class.",
#             "data": serializer.data
#         }, status=status.HTTP_201_CREATED)




#Payment Info
class PaymentInfoView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self,request):
        user = request.user
        print("request user: ", user)
        payments = Payment.objects.filter(stuid=user)

        payment_list = [] 

        

        
        for payment in payments:
            enrollment = Enrollment.objects.filter(payid=payment)
            coursename = enrollment.courseid.title if enrollment else None

            invoice_no = None
            transaction_id = None

            

            if payment.method == 'online' :
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

            payment_list.append({
                    "payid": payment.payid,
                    "date": payment.date.strftime('%Y-%m-%d'),
                    "amount": float(payment.amount),
                    "status": payment.status,
                    "method": payment.method,
                    "course": coursename,
                    "Invoice_No" : invoice_no,
                    "Transaction" : transaction_id
            })

        return Response({"payments" : payment_list})


class StudentProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    @permission_classes([IsAuthenticated])
    
    def get(self,request):
        user = request.user
        print(user)
        print(user.role)

        if user.role != "student":
            return Response({"error":"Only Students allowed"},status=403)
    
        profile = user.student_profile
        print(profile)
        serializer = StudentProfileSerializer(profile)
        return Response(serializer.data)
import hashlib
import base64
import time
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils.decorators import method_decorator
# from django.views.decorators.csrf import csrf_exempt

# @method_decorator(csrf_exempt, name='dispatch')
class CreatePayHereCheckoutUrl(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("AUTH HEADER:", request.headers.get("Authorization"))
        print("USER:", request.user)
        print("IS AUTHENTICATED:", request.user.is_authenticated)

        user = request.user
        course_id = request.data.get("course_id")
        amount = request.data.get("amount")

        if not course_id or not amount:
            return Response({"error": "course_id and amount are required"}, status=400)

        try:
            amount_float = float(amount)
        except ValueError:
            return Response({"error": "Invalid amount format"}, status=400)

        order_id = f"ORDER-{user.id}-{course_id}-{int(time.time())}"
        currency = "LKR"
        merchant_id = "1230994"
        # merchant_secret = "MzkwOTE0MzEzNDE5MjQwNjA2NzI4ODA3Mzk0MzE2MTY5MjYyMzI="
        merchant_secret_base64 = "MzY1ODM3ODU5MjI2MTg3MjI1MjU2ODM5OTczMzM5NzQwMzg3ODc="
        merchant_secret = base64.b64decode(merchant_secret_base64).decode("utf-8")

        hash_string = f"{merchant_id}{order_id}{amount_float:.2f}{currency}{merchant_secret}"
        print(hash_string)
        hashed = hashlib.sha256(hash_string.encode("utf-8")).hexdigest().upper()

        payload = {
            "merchant_id": merchant_id,
            "return_url": "https://rnykx-101-2-191-32.a.free.pinggy.link/students/courses?status=success",
            "cancel_url": "https://rnykx-101-2-191-32.a.free.pinggy.link/students/courses?status=cancel",
            # "notify_url": "https://rnfky-101-2-191-32.a.free.pinggy.link/students/payhere-notify",
            "notify_url": "https://google.com",
            "order_id": order_id,
            "items": "Course Fee",
            "amount": "%.2f" % amount_float,
            "currency": currency,
            "hash": hashed,
            "first_name": user.first_name or "Student",
            "last_name": user.last_name or "",
            "email": user.email or "",
            "phone": getattr(user.student_profile, "mobile", "0771234567"),
            "address": getattr(user.student_profile, "address", "N/A"),
            "city": "Colombo",
            "country": "Sri Lanka",
        }
        print("PAYHERE Payload:", json.dumps(payload, indent=2))

        return Response({
            "url": "https://sandbox.payhere.lk/pay/checkout",
            "params": payload
        })
