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
from instructor.models import Course
from accounts.serializers import StudentProfileSerializer
from google.cloud import vision

import os
import json
import tempfile
from dotenv import load_dotenv

load_dotenv()

creds_json_str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")

if creds_json_str:
    creds_dict = json.loads(creds_json_str)
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
        transaction_id = transaction_id_match.group(1) if transaction_id_match else ""

        # Step 5: Save receipt image + extracted info
        receipt_payment = ReceiptPayment.objects.create(
            payid=payment,
            image_url=image,
            transaction_id=transaction_id,
            verified=False
        )

        serializer = ReceiptPaymentSerializer(receipt_payment)
        return Response({
            "message": "Successfully saved details. After verification, you can enroll in class.",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)


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
