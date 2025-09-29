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
from accounts.serializers import StudentProfileSerializer, UserSerializer
# from google.cloud import vision  # Temporarily commented to fix import error
import hashlib
from django.conf import settings
from django.db import IntegrityError
# from .utils.google_creds import setup_google_credentials  # Temporarily commented
from datetime import datetime, timedelta
from django.utils import timezone
from instructor.models import Exam, ExamQuestion, QuestionOption, ExamSubmission, ExamAnswer
from instructor.serializers import ExamListSerializer, ExamQuestionSerializer
# Initialize Google Cloud credentials once when module loads
# setup_google_credentials()  # Temporarily commented

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

        # Initialize Google Vision API client - TEMPORARILY DISABLED
        # client = vision.ImageAnnotatorClient()
        

        # Read image content from uploaded file
        image_content = image.read()
        # vision_image = vision.Image(content=image_content)

        # Use Google Vision API to detect text in image - TEMPORARILY DISABLED
        # response = client.text_detection(image=vision_image)

        # If no text detected, return a message to re-upload - TEMPORARILY DISABLED
        # if not response.text_annotations:
        #     return Response({'message': "Image not clear. Please re-upload a clearer receipt."}, status=200)
        
        # Temporary fallback - just return success for testing
        return Response({'message': "Receipt uploaded successfully (Vision API temporarily disabled for testing)"}, status=200)

        # Extract full text from first annotation
        full_text = response.text_annotations[0].description

        # Extract amount (e.g., Rs. 1250.00 or 1,250.00)
        record_no_match = re.search(r'Record No\s*(\d+)', full_text,re.IGNORECASE)
        location_match = re.search(r'Location\s*(.*)', full_text, re.IGNORECASE)
        paid_amount_match = re.search(r'RS\.?\s*([\d,\.]+)', full_text, re.IGNORECASE)
        account_no_match = re.search(r'TO\s*(\d+)', full_text, re.IGNORECASE)
        account_name_match = re.search(r'TO\s*\d+\s*(.+)', full_text, re.IGNORECASE)
        date_match = re.search(r'(\d{2}/\d{2}/\d{2})\s+(\d{2}:\d{2})', full_text)
        
        if paid_amount_match:
            amount_str = paid_amount_match.group(1).replace(',', '')
            payment.amount = float(amount_str)
        else:
            payment.amount = 0.0

        payment.save()

        # Parse date and time
        paid_date_time = None
        if date_match:
            date_str = date_match.group(1)
            time_str = date_match.group(2)
            try:
                paid_date_time = datetime.strptime(f"{date_str} {time_str}", "%d/%m/%y %H:%M")
            except ValueError as e:
                print(f"Date parsing error: {e}")

        # Step 5: Save receipt image + extracted info
        try:
            receipt_payment = ReceiptPayment.objects.create(
                payid=payment,
                image_url=image,
                record_no=record_no_match.group(1) if record_no_match else None,
                location=location_match.group(1).strip() if location_match else None,
                paid_amount=paid_amount_match.group(1).replace(',', '') if paid_amount_match else None,
                account_no=account_no_match.group(1) if account_no_match else None,
                account_name=account_name_match.group(1).strip() if account_name_match else None,
                paid_date_time=paid_date_time,
                verified=False
            )
        except IntegrityError as e:
            return Response({'error': 'Duplicate or invalid transaction ID. Please upload a different receipt.'}, status=400)

        # Serialize and return saved receipt payment details
        serializer = ReceiptPaymentSerializer(receipt_payment)
        return Response({
            "message": "Successfully saved details. After verification, you can enroll in class.",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)



#Payment Info
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
            classname = enrollment.classid.title if enrollment else None
            print(f"Payment: {payment.payid}, Enrollment: {enrollment}, Classname: {classname}")

            invoice_no = None
            record_no = None

            if payment.method == 'online' :
                try:
                    online_payment = OnlinePayment.objects.get(payid=payment)
                    invoice_no = online_payment.invoice_no
                except OnlinePayment.DoesNotExist:
                    invoice_no = None

            elif payment.method == 'receipt':
                try:
                    receipt_payment = ReceiptPayment.objects.get(payid=payment)
                    record_no = receipt_payment.record_no
                except ReceiptPayment.DoesNotExist:
                     record_no = None

            # Append payment details to list
            payment_list.append({
                    "payid": payment.payid,
                    "date": payment.date.strftime('%Y-%m-%d'),
                    "amount": float(payment.amount),
                    "status": payment.status,
                    "method": payment.method,
                    "class": classname,
                    "Invoice_No" : invoice_no,
                    "Record_No" : record_no
            })

        return Response({"payments": payment_list})


class StudentProfileView(APIView):
    """
    API view to get student profile details of authenticated user
    """
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
    class_ids = data.get('class_ids')
    class_summary = data.get('items', '')

    if not all([order_id, amount, currency, class_ids]):
        return Response({'error': 'Missing data'}, status=400)
    
    merchant_id = settings.PAYHERE_MERCHANT_ID
    merchant_secret = settings.PAYHERE_MERCHANT_SECRET
     
    print("merchant_id:", merchant_id)
    print("merchant_secret:", merchant_secret)
    
    if not merchant_secret:
        return Response({"error": "Merchant secret not configured"}, status=500)

    # student_profile = user.student_profile

    try:
        payment = Payment.objects.create(
            stuid=user,
            method='online',
            amount=amount,
            status='pending',
        )
        OnlinePayment.objects.create(
            payid=payment,
            invoice_no=payment.payid,
            class_ids=class_ids,
            class_summary=class_summary,
        )

        for cid in class_ids:
            cls = Class.objects.get(classid=cid)
            Enrollment.objects.create(
                payid=payment,
                stuid=user.student_profile,
                classid=cls,
            )
    except Exception as e:
        print("Error saving payment:", e)
        return Response({"error": "Failed to create payment records"}, status=500)

    

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
            for class_id in online.class_ids:
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



class EditStudentProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != "student":
            return Response({"error": "Only Students allowed"}, status=403)

        
        user_serializer = UserSerializer(user)
        return Response(user_serializer.data,status=200)
     
    def put(self, request):
        user = request.user
        if user.role != "student":
            return Response({"error": "Only Students allowed"}, status=403)

        data = request.data
        files = request.FILES

        # Update User fields
        user.first_name = data.get("first_name", user.first_name)
        user.last_name = data.get("last_name", user.last_name)
        user.email = data.get("email", user.email)

        if "password" in data and data.get("password"):
            user.set_password(data["password"])

        user.save()

        # Update StudentProfile fields
        profile = user.student_profile
        profile.address = data.get("address", profile.address)
        profile.city = data.get("city", profile.city)
        profile.district = data.get("district", profile.district)
        profile.mobile = data.get("mobile", profile.mobile)
        profile.nic_no = data.get("nic_no", profile.nic_no)
        profile.school_name = data.get("school_name", profile.school_name)
        profile.year_of_al = data.get("year_of_al", profile.year_of_al)

        if "profile_image" in files:
            profile.profile_image = files["profile_image"]

        profile.save()

        # Return updated data
        serializer = UserSerializer(user)
        return Response(serializer.data, status=200)


from .models import ChatRoom, Message
from .serializers import MessageSerializer
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_messages(request, recipient_role):
    student = request.user

    if recipient_role not in ['instructor', 'admin']:
        return Response({"error": "Invalid chat target"}, status=400)

    # Get or create chat room for this student + recipient
    chat_room, created = ChatRoom.objects.get_or_create(
        created_by=student,
        name=recipient_role
    )

    messages = Message.objects.filter(
        chat_room=chat_room
    ).order_by('created_at')

    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_chat_message(request, recipient_role):
    student = request.user

    if recipient_role not in ['instructor', 'admin']:
        return Response({"error": "Invalid chat target"}, status=400)

    message_text = request.data.get('message')
    if not message_text:
        return Response({"error": "Message text is required"}, status=400)

    chat_room, created = ChatRoom.objects.get_or_create(
        created_by=student,
        name=recipient_role
    )

    message = Message.objects.create(
        chat_room=chat_room,
        sender=student,
        content=message_text,  # Use 'content' instead of 'message'
        message_type='text',
        is_delivered=True
    )

    serializer = MessageSerializer(message)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_messages_read_student(request):
    """
    Mark all messages from instructor and admin as read when student reads them
    """
    if(request.user.role != 'student'):
         return Response({'error':'Only students allowed'},status=403)
    
    # Mark instructor messages as read
    instructor_chat_room = ChatRoom.objects.filter(created_by=request.user, name='instructor').first()
    if instructor_chat_room:
        instructor = User.objects.filter(role='instructor').first()
        if instructor:
            Message.objects.filter(
                chat_room=instructor_chat_room,
                sender=instructor,
                is_seen=False
            ).update(is_seen=True)
    
    # Mark admin messages as read
    admin_chat_room = ChatRoom.objects.filter(created_by=request.user, name='admin').first()
    if admin_chat_room:
        admin = User.objects.filter(role='admin').first()
        if admin:
            Message.objects.filter(
                chat_room=admin_chat_room,
                sender=admin,
                is_seen=False
            ).update(is_seen=True)

    return Response({'status': 'ok'})




from instructor.serializers import ClassSerializer
from instructor.models import Class
from datetime import timedelta, date,datetime
DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

def build_schedule_string(class_obj):
    """Builds a schedule string like: Mon, Wed, Fri 3:30PM–5:00PM"""
    schedules = class_obj.schedules.all()
    if not schedules:
        return None

    time_slots = {}
    for sched in schedules:
        day = sched.day_of_week  # e.g., 'Monday' → 'Mon'
        short_day = day[:3]
        start = sched.start_time.strftime('%I:%M %p')  # e.g., 15:30 → 03:30 PM
        end_dt = (datetime.combine(datetime.today(), sched.start_time) +
                  timedelta(minutes=sched.duration_minutes))
        end = end_dt.strftime('%I:%M %p')
        time_range = f"{start}–{end}"
        if time_range not in time_slots:
            time_slots[time_range] = []
        time_slots[time_range].append((day, short_day))
        

    # Sort by DAYS_ORDER
    def day_order(d):
        full_day = d[0]
        return DAYS_ORDER.index(day)

    result = []
    for time_range, days in time_slots.items():
        days.sort(key=day_order)
        short_day_str = ", ".join(d[1] for d in days)
        result.append(f"{short_day_str} - {time_range}")

    return "\n".join(result)

def build_class_data(class_obj):
    return {
        "classid": class_obj.classid,
        "title": class_obj.title,
        "description": class_obj.description,
        "fee": float(class_obj.fee),
        "start_date": class_obj.start_date.isoformat(),
        "end_date": class_obj.end_date.isoformat() if class_obj.end_date else None,
        "webinar_id": class_obj.webinar.webinar_id if class_obj.webinar else None,
        "schedule": build_schedule_string(class_obj)
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_classess(request):
    student = request.user.student_profile
    enrolled_enrollments = Enrollment.objects.filter(stuid=student).select_related(
        'classid', 'classid__webinar').prefetch_related('classid__schedules')
    enrolled_classes = [e.classid for e in enrolled_enrollments]

    enrolled_data = [build_class_data(c) for c in enrolled_classes]

    all_classes = Class.objects.all()
    other_classes = all_classes.exclude(pk__in=[c.pk for c in enrolled_classes])
    others_data = [build_class_data(c) for c in other_classes]
    print("Enrolled Classes Data:")
    print(enrolled_data)

    return Response({
        "enrolled": enrolled_data,
        "others": others_data
    })

from instructor.models import Marks
from collections import defaultdict
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getStudentMarks(request):
    """
    API view to get marks for a specific student
    """
   
    student = request.user.student_profile
    marks_qs = Marks.objects.filter(stuid=student).select_related('examid','examid__classid').order_by('examid__date')
    result =defaultdict(list)

    for mark in marks_qs:
        class_name = mark.examid.classid.title
        exam_month = mark.examid.date.strftime('%Y-%m')
        result[class_name].append({
            "month":exam_month,
            "marks": mark.marks,
        })
    response_data = []

    for class_name,data in result.items():
        response_data.append({
            "class_name": class_name,
            "marks": data
        })

    return Response({
        "marks": response_data
    },status=status.HTTP_200_OK)
       


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def enroll_class(request):
    """
    API view to enroll a student in a class
    """
    student = request.user.student_profile
    enrollments = Enrollment.objects.filter(stuid=student).select_related('classid')
    if not enrollments:
        return Response({"error": "No class found for enrollment"}, status=status.HTTP_404_NOT_FOUND)

    data = []
    for enrollClass in enrollments:
        data.append({
            "enrollid": enrollClass.enrollid,
            "classid": enrollClass.classid.classid,
            "title": enrollClass.classid.title,
            "description": enrollClass.classid.description,
            "fee": float(enrollClass.classid.fee),
            "start_date": enrollClass.classid.start_date.isoformat(),
            "end_date": enrollClass.classid.end_date.isoformat() if enrollClass.classid.end_date else None,
        })
        # print(data)
    return Response(data, status=status.HTTP_200_OK)


from .serializers import CalendarEventSerializer
from.models import CalendarEvent
from edu_admin.models import ZoomWebinar, ZoomOccurrence
from instructor.models import Exams
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def calendarEvent(request):
    #fetch webinars
    user = request.user
    try:
        student = StudentProfile.objects.get(user=user)
    except:
        return Response({"error": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
    
    # Step 1: Get all enrolled classes for this student
    enrolled_classes = Enrollment.objects.filter(stuid=student).select_related("classid")
    class_ids = enrolled_classes.values_list("classid__id",flat=True)
    

   # 3. Get related webinars from those classes
    webinar_ids = Class.objects.filter(id__in=class_ids).values_list("webinar_id", flat=True)

    # 4. Now get all occurrences linked to those webinars
    webinars = ZoomOccurrence.objects.filter(webinar_id__in=webinar_ids).select_related("webinar")
    webinar_data = [
        {
            "id": webinar.id,
            "title": webinar.webinar.topic,
            "webinarid":webinar.webinar.webinar_id,
            "type": "webinar",
            "date": webinar.start_time,
            "color": "red",
        }
        for webinar in webinars
    ]

    #fetch exams
    exams = Exams.objects.filter(classid__in=class_ids)
    exam_data = [
        {
            "id": exam.id,
            "title": exam.examname,
            "type": "exam",
            "date": exam.date.isoformat(),
            "color": "purple",
        }
        for exam in exams
    ]

    #combine
    events = webinar_data + exam_data
    return Response(events, status=status.HTTP_200_OK)


# Student Exam API Views

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_exams(request):
    """Get all available exams for the student based on enrolled classes"""
    try:
        student = StudentProfile.objects.get(user=request.user)
        
        # Get enrolled classes
        enrolled_classes = Enrollment.objects.filter(stuid=student)
        class_ids = enrolled_classes.values_list("classid__id", flat=True)
        
        # Get published exams for those classes
        exams = Exam.objects.filter(
            classid__in=class_ids,
            is_published=True
        ).select_related('classid').order_by('-created_at')
        
        exam_data = []
        current_datetime = timezone.now()
        current_date = current_datetime.date()
        current_time = current_datetime.time()
        
        for exam in exams:
            # Check if student has already attempted
            submission = ExamSubmission.objects.filter(exam=exam, student=student).first()
            
            # Calculate exam time window
            exam_start_datetime = datetime.combine(exam.date, exam.start_time)
            exam_end_datetime = exam_start_datetime + timedelta(minutes=exam.duration_minutes)
            
            # Make datetime objects timezone-aware
            exam_start_datetime = timezone.make_aware(exam_start_datetime)
            exam_end_datetime = timezone.make_aware(exam_end_datetime)
            
            # Determine exam availability status
            is_available = False
            availability_status = "not_started"  # not_started, available, expired, completed
            availability_message = ""
            
            if submission and submission.is_completed:
                availability_status = "completed"
                availability_message = f"Completed on {submission.submitted_at.strftime('%Y-%m-%d %H:%M')}"
                is_available = False
            elif current_datetime < exam_start_datetime:
                availability_status = "not_started"
                availability_message = f"Exam starts at {exam.start_time.strftime('%H:%M')} on {exam.date.strftime('%Y-%m-%d')}"
                is_available = False
            elif exam_start_datetime <= current_datetime <= exam_end_datetime:
                availability_status = "available"
                remaining_minutes = int((exam_end_datetime - current_datetime).total_seconds() / 60)
                availability_message = f"Available now! {remaining_minutes} minutes remaining"
                is_available = True
            else:  # current_datetime > exam_end_datetime
                availability_status = "expired"
                availability_message = f"Exam ended at {exam_end_datetime.strftime('%H:%M on %Y-%m-%d')}"
                is_available = False
            
            exam_info = {
                "id": exam.id,
                "examname": exam.examname,
                "description": exam.description,
                "class_name": exam.classid.title,
                "date": exam.date.isoformat(),
                "start_time": exam.start_time.strftime('%H:%M'),
                "end_time": exam_end_datetime.strftime('%H:%M'),
                "duration_minutes": exam.duration_minutes,
                "total_marks": exam.total_marks,
                "questions_count": exam.questions.count(),
                "attempted": submission is not None,
                "submission_id": submission.id if submission else None,
                "score": submission.percentage if submission else None,
                "status": exam.status,
                "is_available": is_available,
                "availability_status": availability_status,
                "availability_message": availability_message
            }
            exam_data.append(exam_info)
        
        return Response({"exams": exam_data}, status=status.HTTP_200_OK)
    
    except StudentProfile.DoesNotExist:
        return Response({"error": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_exam_details(request, exam_id):
    """Get exam details for taking the exam"""
    try:
        student = StudentProfile.objects.get(user=request.user)
        
        # Verify student has access to this exam
        enrolled_classes = Enrollment.objects.filter(stuid=student).values_list("classid__id", flat=True)
        exam = Exam.objects.get(id=exam_id, classid__in=enrolled_classes, is_published=True)
        
        # Check time-based availability
        current_datetime = timezone.now()
        exam_start_datetime = datetime.combine(exam.date, exam.start_time)
        exam_end_datetime = exam_start_datetime + timedelta(minutes=exam.duration_minutes)
        
        # Make datetime objects timezone-aware
        exam_start_datetime = timezone.make_aware(exam_start_datetime)
        exam_end_datetime = timezone.make_aware(exam_end_datetime)
        
        # Check if exam is currently available
        if current_datetime < exam_start_datetime:
            return Response({
                "error": f"Exam has not started yet. It will be available from {exam.start_time.strftime('%H:%M')} on {exam.date.strftime('%Y-%m-%d')}"
            }, status=status.HTTP_403_FORBIDDEN)
        
        if current_datetime > exam_end_datetime:
            return Response({
                "error": f"Exam has expired. It was available until {exam_end_datetime.strftime('%H:%M on %Y-%m-%d')}"
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if already submitted (unless multiple attempts allowed)
        if not exam.allow_multiple_attempts:
            existing_submission = ExamSubmission.objects.filter(exam=exam, student=student, is_completed=True).first()
            if existing_submission:
                return Response({"error": "You have already completed this exam"}, status=400)
        
        # Get questions with options
        questions = exam.questions.all().order_by('order')
        questions_data = []
        
        for question in questions:
            question_data = {
                "id": question.id,
                "question_text": question.question_text,
                "question_type": question.question_type,
                "description": question.description,
                "is_required": question.is_required,
                "marks": question.marks,
                "order": question.order,
                "options": []
            }
            
            # Add options for choice-based questions
            if question.question_type in ['multiple_choice', 'multiple_select', 'dropdown', 'true_false']:
                options = question.options.all().order_by('order')
                question_data["options"] = [
                    {
                        "id": option.id,
                        "option_text": option.option_text,
                        "order": option.order
                    } for option in options
                ]
            
            # Add scale info for linear scale questions
            elif question.question_type == 'linear_scale':
                question_data.update({
                    "scale_min": question.scale_min,
                    "scale_max": question.scale_max,
                    "scale_min_label": question.scale_min_label,
                    "scale_max_label": question.scale_max_label
                })
            
            questions_data.append(question_data)
        
        exam_data = {
            "id": exam.id,
            "examname": exam.examname,
            "description": exam.description,
            "class_name": exam.classid.title,
            "duration_minutes": exam.duration_minutes,
            "total_marks": exam.total_marks,
            "shuffle_questions": exam.shuffle_questions,
            "confirmation_message": exam.confirmation_message,
            "questions": questions_data
        }
        
        return Response(exam_data, status=status.HTTP_200_OK)
    
    except StudentProfile.DoesNotExist:
        return Response({"error": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exam.DoesNotExist:
        return Response({"error": "Exam not found or access denied."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_exam_attempt(request, exam_id):
    """Start an exam attempt (create submission record)"""
    try:
        try:
            student = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response({
                "error": "Student profile not found. Please contact administrator."
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Verify access and check time availability
        enrolled_classes = Enrollment.objects.filter(stuid=student).values_list("classid__id", flat=True)
        
        try:
            exam = Exam.objects.get(id=exam_id, classid__in=enrolled_classes, is_published=True)
        except Exam.DoesNotExist:
            return Response({
                "error": "Exam not found or you don't have access to this exam."
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check time-based availability
        current_datetime = timezone.now()
        exam_start_datetime = datetime.combine(exam.date, exam.start_time)
        exam_end_datetime = exam_start_datetime + timedelta(minutes=exam.duration_minutes)
        
        # Make datetime objects timezone-aware
        exam_start_datetime = timezone.make_aware(exam_start_datetime)
        exam_end_datetime = timezone.make_aware(exam_end_datetime)
        
        if current_datetime < exam_start_datetime:
            return Response({
                "error": f"Exam has not started yet. It will be available from {exam.start_time.strftime('%H:%M')} on {exam.date.strftime('%Y-%m-%d')}"
            }, status=status.HTTP_403_FORBIDDEN)
        
        if current_datetime > exam_end_datetime:
            return Response({
                "error": f"Exam has expired. It was available until {exam_end_datetime.strftime('%H:%M on %Y-%m-%d')}"
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if already has incomplete submission
        existing_submission = ExamSubmission.objects.filter(
            exam=exam, 
            student=student, 
            is_completed=False
        ).first()
        
        if existing_submission:
            return Response({
                "submission_id": existing_submission.id,
                "started_at": existing_submission.started_at
            }, status=status.HTTP_200_OK)
        
        # Create new submission
        submission = ExamSubmission.objects.create(
            exam=exam,
            student=student,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({
            "submission_id": submission.id,
            "started_at": submission.started_at
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_exam_answers(request, exam_id):
    """Submit all exam answers and complete the exam"""
    try:
        try:
            student = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response({
                "error": "Student profile not found. Please contact administrator."
            }, status=status.HTTP_404_NOT_FOUND)
            
        try:
            exam = Exam.objects.get(id=exam_id)
        except Exam.DoesNotExist:
            return Response({
                "error": "Exam not found or you don't have access to this exam."
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get the submission
        try:
            submission = ExamSubmission.objects.get(
                exam=exam,
                student=student,
                is_completed=False
            )
        except ExamSubmission.DoesNotExist:
            return Response({
                "error": "No active exam submission found. Please start the exam first."
            }, status=status.HTTP_404_NOT_FOUND)
        
        answers_data = request.data.get('answers', [])
        total_score = 0
        total_possible_marks = 0
        
        # Process each answer
        for answer_data in answers_data:
            question_id = answer_data.get('question_id')
            question = ExamQuestion.objects.get(id=question_id, exam=exam)
            total_possible_marks += question.marks
            
            # Delete existing answer if any
            ExamAnswer.objects.filter(submission=submission, question=question).delete()
            
            # Create new answer
            answer = ExamAnswer.objects.create(
                submission=submission,
                question=question
            )
            
            # Calculate score based on question type
            score = 0
            if question.question_type in ['multiple_choice', 'true_false']:
                # Single choice questions
                selected_option_id = answer_data.get('selected_option')
                if selected_option_id:
                    option = QuestionOption.objects.get(id=selected_option_id)
                    answer.selected_options.add(option)
                    if option.is_correct:
                        score = question.marks
                        answer.is_correct = True
                        
            elif question.question_type == 'multiple_select':
                # Multiple choice questions
                selected_option_ids = answer_data.get('selected_options', [])
                correct_options = list(question.options.filter(is_correct=True).values_list('id', flat=True))
                
                if set(selected_option_ids) == set(correct_options):
                    score = question.marks
                    answer.is_correct = True
                    
                for option_id in selected_option_ids:
                    option = QuestionOption.objects.get(id=option_id)
                    answer.selected_options.add(option)
                    
            elif question.question_type in ['short_answer', 'paragraph']:
                # Text questions (manual grading needed)
                answer.text_answer = answer_data.get('text_answer', '')
                # For now, give full marks for attempting (instructor can adjust)
                if answer.text_answer.strip():
                    score = question.marks
                    
            elif question.question_type == 'linear_scale':
                # Scale questions
                numeric_value = answer_data.get('numeric_answer')
                if numeric_value is not None:
                    answer.numeric_answer = float(numeric_value)
                    # Give full marks for any valid answer in range
                    if question.scale_min <= numeric_value <= question.scale_max:
                        score = question.marks
                        answer.is_correct = True
                        
            elif question.question_type == 'dropdown':
                # Dropdown questions
                selected_option_id = answer_data.get('selected_option')
                if selected_option_id:
                    option = QuestionOption.objects.get(id=selected_option_id)
                    answer.selected_options.add(option)
                    if option.is_correct:
                        score = question.marks
                        answer.is_correct = True
            
            elif question.question_type in ['date', 'time']:
                # Date/Time questions - award marks for valid input
                if question.question_type == 'date':
                    date_value = answer_data.get('date_answer')
                    if date_value:
                        try:
                            from datetime import datetime
                            answer.date_answer = datetime.strptime(date_value, '%Y-%m-%d').date()
                            score = question.marks
                            answer.is_correct = True
                        except (ValueError, TypeError):
                            pass
                elif question.question_type == 'time':
                    time_value = answer_data.get('time_answer')
                    if time_value:
                        try:
                            from datetime import datetime
                            answer.time_answer = datetime.strptime(time_value, '%H:%M').time()
                            score = question.marks
                            answer.is_correct = True
                        except (ValueError, TypeError):
                            pass
            
            elif question.question_type == 'file_upload':
                # File upload questions - require manual grading
                file_answer = answer_data.get('file_answer')
                if file_answer:
                    answer.file_answer = file_answer
                    # Don't award marks automatically - instructor will grade manually
                    score = 0
                        
            # Save the score
            answer.marks_obtained = score
            answer.save()
            total_score += score
        
        # Calculate percentage
        percentage = (total_score / total_possible_marks * 100) if total_possible_marks > 0 else 0
        
        # Update submission
        submission.total_marks_obtained = total_score
        submission.percentage = percentage
        submission.is_completed = True
        
        try:
            submission.submitted_at = timezone.now()
        except NameError:
            # Fallback if timezone import failed
            from django.utils import timezone as tz
            submission.submitted_at = tz.now()
            
        submission.save()
        
        return Response({
            "message": "Exam submitted successfully!",
            "submission_id": submission.id,
            "total_score": total_score,
            "total_possible_marks": total_possible_marks,
            "percentage": percentage
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_exam_results(request, exam_id):
    """Get exam results for a student"""
    try:
        try:
            student = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response({
                "error": "Student profile not found. Please contact administrator."
            }, status=status.HTTP_404_NOT_FOUND)
            
        try:
            exam = Exam.objects.get(id=exam_id)
        except Exam.DoesNotExist:
            return Response({
                "error": "Exam not found or you don't have access to this exam."
            }, status=status.HTTP_404_NOT_FOUND)
        
        try:
            submission = ExamSubmission.objects.get(
                exam=exam,
                student=student,
                is_completed=True
            )
        except ExamSubmission.DoesNotExist:
            return Response({
                "error": "No completed exam submission found. Please complete the exam first."
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get detailed answers
        answers = submission.answers.all().select_related('question')
        results = []
        
        for answer in answers:
            question = answer.question
            answer_data = {
                "question_text": question.question_text,
                "question_type": question.question_type,
                "marks": question.marks,
                "marks_obtained": answer.marks_obtained,
                "is_correct": answer.is_correct
            }
            
            # Add answer details based on type
            if question.question_type in ['multiple_choice', 'multiple_select', 'dropdown', 'true_false']:
                selected_options = list(answer.selected_options.all().values_list('option_text', flat=True))
                correct_options = list(question.options.filter(is_correct=True).values_list('option_text', flat=True))
                answer_data.update({
                    "selected_options": selected_options,
                    "correct_options": correct_options
                })
            elif question.question_type in ['short_answer', 'paragraph']:
                answer_data["text_answer"] = answer.text_answer
            elif question.question_type == 'linear_scale':
                answer_data["numeric_answer"] = answer.numeric_answer
                
            results.append(answer_data)
        
        return Response({
            "exam_name": exam.examname,
            "total_score": submission.total_marks_obtained,
            "total_possible_marks": exam.total_marks,
            "percentage": submission.percentage,
            "submitted_at": submission.submitted_at,
            "results": results
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from .models import Notification
from students.models import StudentProfile
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    try:
        student = StudentProfile.objects.get(user=request.user)
        notifications = Notification.objects.filter(student_id=student).order_by('-created_at')

        data = [
            {
                'note_id': n.note_id,
                'title': n.title,
                'message': n.message,
                'type': n.type,
                'created_at': n.created_at.strftime('%Y-%m-%d %H:%M'),
                'read_status': n.read_status,
            }
            for n in notifications
        ]
        unread_count = notifications.filter(read_status=False).count()

        return Response({'notifications': data, 'unread_count': unread_count}, status=status.HTTP_200_OK)
    except StudentProfile.DoesNotExist:
        return Response({'error': 'User Profile not found'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, pk):
    try:
        student_profile = request.user.student_profile  # get related StudentProfile
        notif = Notification.objects.get(pk=pk, student_id=student_profile)
        notif.read_status = True
        notif.save()
        return Response({'status': 'marked as read'})
    except StudentProfile.DoesNotExist:
        return Response({'error': 'User Profile not found'}, status=404)
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=404)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, pk):
    try:
        student_profile = request.user.student_profile  # get related StudentProfile
        notif = Notification.objects.get(pk=pk, student_id=student_profile)
        notif.delete()
        return Response({'status': 'notification deleted successfully'}, status=status.HTTP_200_OK)
    except StudentProfile.DoesNotExist:
        return Response({'error': 'User Profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)


from instructor.models import StudyNote,Class
from instructor.serializers import StudyNoteSerializer
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notes(request, classid):
    """
    Get all StudyNotes for a class given its classid (e.g., CRS-1B7F02)
    """
    print(f"🔍 Getting notes for classid: {classid}")
    
    try:
        
        # Get class object by classid
        class_obj = Class.objects.get(classid=classid)
        print(f"✅ Found class: {class_obj.title} (ID: {class_obj.id})")

        # Get all notes related to this class - use the class object, not the title
        notes = StudyNote.objects.filter(related_class=class_obj)  # Use class_obj, not class title
        print(f"📚 Found {notes.count()} notes in database")
        
        # Debug each note's file
        for note in notes:
            print(f"  - Note ID {note.id}: '{note.title}'")
            print(f"    File field: {note.file}")
            if note.file:
                print(f"    File name: {note.file.name}")
                print(f"    File path: {note.file.path}")
                print(f"    File URL: {note.file.url}")
            else:
                print(f"    No file attached")
        
        serializer = StudyNoteSerializer(notes, many=True, context={'request': request})
        serialized_data = serializer.data
        
        # Debug serialized file data
        print(f"📝 Serializing {len(notes)} notes...")
        for note_data in serialized_data:
            print(f"  - Serialized '{note_data['title']}': file={note_data.get('file', 'NO FILE FIELD')}")

        # Prepare class details
        class_details = {
            'id': class_obj.id,
            'title': class_obj.title,
            'description': class_obj.description,
            'instructor': class_obj.instructor.get_full_name() if class_obj.instructor else None,
        }

        response_data = {
            'notes': serialized_data,
            'class_details': class_details
        }
        
        print(f"✅ Returning response with {len(serialized_data)} notes")
        return Response(response_data, status=status.HTTP_200_OK)

    except Class.DoesNotExist:
        print(f"❌ Class not found with classid: {classid}")
        return Response({
            'notes': [],
            'class_details': None,
            'error': f'Class with ID {classid} not found'
        }, status=status.HTTP_404_NOT_FOUND)
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        print(f"❌ Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': str(e),
            'notes': [],
            'class_details': None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def link_notes_to_webinar(request, classid):
    """
    Link existing StudyNote records to the webinar associated with a class
    """
    try:
        # Get class object by classid
        class_obj = Class.objects.get(classid=classid)
        webinar = class_obj.webinar
        
        if not webinar:
            return Response({'error': 'Class has no associated webinar'}, status=400)
        
        # Check if there are any StudyNote records
        all_notes = StudyNote.objects.all()
        
        if not all_notes.exists():
            # Create a test StudyNote record with the existing image
            from django.core.files import File
            import os
            
            # Get the existing image file
            image_path = os.path.join(settings.MEDIA_ROOT, 'study_notes', 'Periodic_Table_ncEQrzK.jpg')
            if os.path.exists(image_path):
                with open(image_path, 'rb') as f:
                    django_file = File(f)
                    test_note = StudyNote.objects.create(
                        title="Periodic Table of Elements",
                        description="Complete periodic table with all elements and their properties",
                        batch="Chemistry",
                        file=django_file,
                        related_class=webinar,
                        uploaded_by=request.user
                    )
                    test_note.save()
                
                return Response({
                    'message': f'Created and linked 1 test note to webinar {webinar.topic}',
                    'webinar_id': webinar.id,
                    'webinar_topic': webinar.topic,
                    'note_created': True
                })
            else:
                return Response({'error': 'No StudyNote records found and no test image available'}, status=404)
        
        # Get all StudyNotes that are not linked to any webinar
        unlinked_notes = StudyNote.objects.filter(related_class__isnull=True)
        
        # If no unlinked notes, get all notes and link them to this webinar
        if not unlinked_notes.exists():
            updated_count = 0
            
            for note in all_notes:
                note.related_class = webinar
                note.save()
                updated_count += 1
            
            return Response({
                'message': f'Linked {updated_count} notes to webinar {webinar.topic}',
                'webinar_id': webinar.id,
                'webinar_topic': webinar.topic
            })
        else:
            # Link unlinked notes to this webinar
            updated_count = 0
            for note in unlinked_notes:
                note.related_class = webinar
                note.save()
                updated_count += 1
            
            return Response({
                'message': f'Linked {updated_count} unlinked notes to webinar {webinar.topic}',
                'webinar_id': webinar.id,
                'webinar_topic': webinar.topic
            })
        
    except Class.DoesNotExist:
        return Response({'error': 'Class not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


from rest_framework.permissions import AllowAny
@api_view(['GET'])
@permission_classes([AllowAny])
def getAllClass(request):
    try:
        classes = Class.objects.all()
        serializer = ClassSerializer(classes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



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

