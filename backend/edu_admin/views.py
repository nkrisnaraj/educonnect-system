from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import ZoomWebinarSerializer, ZoomWebinarListSerializer, ZoomOccurrenceSerializer, ZoomWebinarSerilizer
from .models import ZoomWebinar
from .zoom_api import ZoomAPIClient
import traceback
from .services import ZoomWebinarService

# Create your views here.
class CreateZoomWebinarView(APIView):
    def post(self, request):
        serializer = ZoomWebinarSerializer(data = request.data)
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
                end_date_time=data.get('end_date_time')
            )
            return Response({
                "message": "Webinar created successfully",
                "data":webinar_data
            }, status=status.HTTP_201_CREATED
            )
        
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
        
class WebinarListAPIView(APIView):
    def get(self, request):
        webinars = ZoomWebinar.objects.all().order_by('-start_time')
        serializer = ZoomWebinarSerilizer(webinars, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)