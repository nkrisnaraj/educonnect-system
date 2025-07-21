from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import ZoomWebinarSerializer, ZoomWebinarListSerializer, ZoomOccurrenceSerializer, ZoomWebinarSerilizer
from .models import ZoomWebinar
from .zoom_api import ZoomAPIClient
import traceback
from .services import ZoomWebinarService
from rest_framework.decorators import api_view


# Create your views here.
class CreateZoomWebinarView(APIView):
    def post(self, request):
        serializer = ZoomWebinarSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data

        try:
            zoom = ZoomAPIClient(data['account_key'])
            webinar_data = zoom.create_webinar(
                topic=data['topic'],
                start_time=data['start_time'],
                duration=data['duration'],
                agenda=data.get('agenda', ''),
                repeat_type=data.get('repeat_type'),
                repeat_interval=data.get('repeat_interval', 1),
                end_date_time=data.get('end_date_time'),
                weekly_days=data.get('weekly_days')  # <-- Pass weekly_days
            )
            return Response({
                "message": "Webinar created successfully",
                "data": webinar_data
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)         

class ListZoomWebinarsView(APIView):
    def get(self, request):
        serializer = ZoomWebinarListSerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        account_key = serializer.validated_data.get("account_key")
        if not account_key:
            return Response({"error": "account_key is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            service = ZoomWebinarService(account_key)
            webinars = service.get_all_detailed_webinars()

            return Response({"webinars": webinars}, status=status.HTTP_200_OK)

        except Exception as e:
            print("🔥 Zoom API Error:")
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class SyncZoomWebinarsView(APIView):
    def post(self, request):
        serializer = ZoomWebinarListSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        account_key = serializer.validated_data.get("account_key")

        try:
            service = ZoomWebinarService(account_key)
            service.sync_webinars_to_db()
            return Response({"message": "Webinars synced successfully"}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        
        
from rest_framework.permissions import IsAuthenticated

class WebinarListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        webinars = ZoomWebinar.objects.all().order_by('-start_time')
        serializer = ZoomWebinarSerilizer(webinars, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# get zoom accounts
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.conf import settings

class ZoomAccountsListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response([
            {"key": k, "email": v["user_id"]}
            for k, v in settings.ZOOM_ACCOUNTS.items()
        ])

from datetime import datetime, timedelta
import pytz
from django.utils.dateparse import parse_time, parse_date
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from instructor.models import Class, ClassSchedule
from django.contrib.auth import get_user_model
from .services import ZoomWebinarService
import instructor.serializers as serializers

User = get_user_model()

# Zoom weekdays format: 1=Sun, 2=Mon, ..., 7=Sat
VALID_ZOOM_WEEKDAYS = set(range(1, 8))

class CreateClassWithWebinarView(APIView):
    def post(self, request):
        data = request.data
        try:
            title = data.get("title")
            description = data.get("description")
            fee = data.get("fee")
            start_date = parse_date(data.get("start_date"))
            end_date = parse_date(data.get("end_date"))
            schedules = data.get("schedules", [])
            zoom_schedule = data.get("zoom_schedule")
            zoom_account_key = data.get("zoom_account_key")
            repeat_type = data.get("repeat_type", "weekly")

            if not (title and start_date and end_date and zoom_schedule):
                return Response({"error": "Missing required fields"}, status=400)
            

            # 🕐 Parse times & weekly days
            colombo_tz = pytz.timezone("Asia/Colombo")
            zoom_start_time = parse_time(zoom_schedule["start_time"])
            zoom_duration = int(zoom_schedule["duration_minutes"])
            weekly_days = zoom_schedule["weekly_days"]  # Example: [2, 4, 6]

            # ✅ Validate weekday numbers
            if not all(day in VALID_ZOOM_WEEKDAYS for day in weekly_days):
                return Response({"error": "weekly_days must be integers 1 (Sunday) to 7 (Saturday)"}, status=400)

            # 📅 Combine date & time, apply timezone
            combined_start_dt = colombo_tz.localize(datetime.combine(start_date, zoom_start_time))

            # 🔁 Adjust end date to nearest valid weekday before or on end_date
            current = end_date
            while current >= start_date:
                # weekday() gives Monday=0, Sunday=6 → Zoom: Sunday=1, Monday=2, ..., Saturday=7
                zoom_day = (current.weekday() + 1) % 7 + 1
                if zoom_day in weekly_days:
                    break
                current -= timedelta(days=1)

            if current < start_date:
                return Response({"error": "No valid weekday found between start_date and end_date"}, status=400)

            # ⏳ Final end datetime
            end_datetime = colombo_tz.localize(datetime.combine(current, zoom_start_time) + timedelta(minutes=zoom_duration))
            def calculate_occurrence_count(start_date, end_date, weekly_days):
                count = 0
                current = start_date
                weekday_set = set(weekly_days)

                while current <= end_date:
                    if current.isoweekday() in weekday_set:
                        count += 1
                    current += timedelta(days=1)
                
                return count
            end_times = calculate_occurrence_count(start_date, end_date, weekly_days)

            # 🔗 Call Zoom service
            zoom_service = ZoomWebinarService(zoom_account_key)
            webinar_obj, zoom_data = zoom_service.create_and_save_webinar(
                topic=title,
                start_time=combined_start_dt,
                duration=zoom_duration,
                agenda=description,
                repeat_type=repeat_type,
                end_date_time=end_datetime,
                weekly_days=weekly_days,
                end_times=end_times,  # Pass end_times to the service
            )

            # 🎓 Create Class
            new_class = Class.objects.create(
                title=title,
                description=description,
                fee=fee,
                start_date=start_date,
                end_date=end_date,
                instructor=User.objects.filter(role="instructor").first(),  # Replace with actual logic
                webinar=webinar_obj
            )

            # 🗓️ Create ClassSchedule records
            for sched in schedules:
                for day in sched["days_of_week"]:
                    ClassSchedule.objects.create(
                        class_obj=new_class,
                        day_of_week=day,
                        start_time=parse_time(sched["start_time"]),
                        duration_minutes=int(sched["duration_minutes"]),
                    )

            # ✅ Serialize and respond
            serializer = serializers.ClassSerializer(new_class)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            print("🔥 Error in CreateClassWithWebinarView:", str(e))
            return Response({"error": str(e)}, status=500)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions


class ClassListView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # or IsAdminUser if needed

    def get(self, request):
        classes = Class.objects.all().order_by('-start_date')
        serializer = serializers.ClassSerializer(classes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from accounts.serializers import UserSerializer

User = get_user_model()

class StudentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        students = User.objects.filter(role='student').select_related('student_profile')
        serializer = UserSerializer(students, many=True)
        return Response(serializer.data)
