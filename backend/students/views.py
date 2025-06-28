import json
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Payment, OnlinePayment, ReceiptPayment, Enrollment, PaymentTest
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
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import hashlib
from django.conf import settings


import os
import json
import tempfile
from dotenv import load_dotenv

load_dotenv()

creds_json_str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")

if creds_json_str:
    creds_dict = json.loads(creds_json_str)
    print(creds_dict['private_key'])
else:
    print("GOOGLE_APPLICATION_CREDENTIALS_JSON not set")

temp_file = tempfile.NamedTemporaryFile(mode='w+', delete=False, suffix='.json')
json.dump(creds_dict, temp_file)
temp_file.flush()

# Set Google API path
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = temp_file.name

# ✅ Check Temp File Path + Content for Debugging
print("✅ Temp Google Auth JSON written at:", temp_file.name)
print("✅ File exists:", os.path.exists(temp_file.name))


User = get_user_model()

#pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

merchant_id = settings.PAYHERE_MERCHANT_ID
merchant_secret = settings.PAYHERE_MERCHANT_SECRET


from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])  
def payment_notify(request):

    print("DEBUG: Received payment notification")
    data = request.data

    order_id = data.get('order_id')
    amount = data.get('payhere_amount')
    currency = data.get('payhere_currency')
    status_code = data.get('status_code')  # 2 = Success
    received_sig = data.get('md5sig')

    # merchant_id = settings.PAYHERE_MERCHANT_ID
    # merchant_secret = settings.PAYHERE_MERCHANT_SECRET

    if not all([order_id, amount, currency, status_code, received_sig]):
        return Response({"error": "Missing payment fields"}, status=400)

    # ✅ Verify the signature
    hash_string = f"{merchant_id}{order_id}{amount}{currency}{status_code}{hashlib.md5(merchant_secret.encode()).hexdigest().upper()}"
    expected_sig = hashlib.md5(hash_string.encode()).hexdigest().upper()

    if received_sig == expected_sig and status_code == '2':
        try:
            payment = PaymentTest.objects.get(order_id=order_id)
            payment.status = 'completed'
            payment.save()
            print(f"✅ Payment verified and updated: {order_id}")
            return Response("Payment verified", status=200)
        except PaymentTest.DoesNotExist:
            print(f"❌ Payment not found for order: {order_id}")
            return Response("Payment not found", status=404)
    else:
        print("❌ Invalid signature or failed status code")
        return Response("Invalid signature", status=400)

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

class ReceiptUploadView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        user = request.user
        image = request.FILES.get("image")
        method = 'receipt'

        if not image:
            return Response({'error': "No image provided"}, status=400)

        # Validate file size (max 5MB)
        if image.size > 5 * 1024 * 1024:
            return Response({'error': "File too large. Maximum size is 5MB"}, status=400)

        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/jpg']
        if image.content_type not in allowed_types:
            return Response({'error': "Invalid file type. Only JPEG and PNG are allowed"}, status=400)

        try:
            # Create payment with zero amount in transaction
            with transaction.atomic():
                payment = Payment.objects.create(
                    stuid=user, 
                    method=method, 
                    amount=0.0,
                    status='pending'
                )

                # Setup Google Vision client with error handling
                try:
                    client = vision.ImageAnnotatorClient()
                except Exception as e:
                    logger.error(f"Failed to initialize Vision client: {str(e)}")
                    return Response({'error': "OCR service unavailable"}, status=503)

                # Read uploaded image and send to Vision API
                try:
                    image_content = image.read()
                    vision_image = vision.Image(content=image_content)
                    response = client.text_detection(image=vision_image)
                except Exception as e:
                    logger.error(f"Vision API error: {str(e)}")
                    return Response({'error': "Failed to process image"}, status=500)

                if not response.text_annotations:
                    payment.status = 'failed'
                    payment.save()
                    return Response({
                        'error': "Could not detect text in image. Please upload a clearer receipt."
                    }, status=400)

                # Process OCR results here...
                # Add your existing OCR processing logic

                return Response({'message': "Receipt uploaded successfully"}, status=201)

        except Exception as e:
            logger.error(f"Receipt upload error: {str(e)}")
            return Response({'error': "Failed to process receipt"}, status=500)


# class ReceiptUploadView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]
#     parser_classes = [MultiPartParser,FormParser]



#     def post(self, request):
#         user = request.user
#         image = request.FILES.get("image")
#         method = 'receipt'
        

#         if not image:
#             return Response({'error':"No image provided"},status=400)
        
#         payment = Payment.objects.create(stuid=user, method=method,amount=0.0)

#         #OCR the receipt
#         ocr_image = Image.open(image)
#         text = pytesseract.image_to_string(ocr_image)

#         print("OCR TEXT:\n",text)

#         amount_match = re.search(r'(Rs\.?|LKR)?\s*([\d,]+(?:\.\d{2})?)', text)
#         amount = float(amount_match.group(2).replace(',', ''))if amount_match else 0.0
#         payment.amount = amount
#         payment.save()

#         transaction_id_match = re.search(r'Transaction ID[:\- ]+(\w+)', text)
#         transaction_id = transaction_id_match.group(1) if transaction_id_match else ""
        
        

#         receipt_payment = ReceiptPayment.objects.create(
#             payid = payment,
#             image_url = image,
#             transaction_id=transaction_id,
#             verified = False
#         )

#         serializer = ReceiptPaymentSerializer(receipt_payment)
#         return Response({"message":"Successfully Saved Details","data":serializer.data},status=status.HTTP_201_CREATED)

    


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

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import hashlib
from django.conf import settings
from .models import PaymentTest  # Use your actual model name

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
        PaymentTest.objects.create(
            user=user,
            order_id=order_id,
            amount=amount,
            currency=currency,
            status="pending"
        )

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
