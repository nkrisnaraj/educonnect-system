from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import ZoomWebinarSerializer
from .zoom_api import ZoomAPIClient

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
            