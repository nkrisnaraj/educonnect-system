from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import ZoomWebinarSerializer, ZoomWebinarListSerializer, ZoomOccurrenceSerializer, ZoomWebinarSerilizer
from .models import ZoomWebinar
from .zoom_api import ZoomAPIClient
import traceback
from .services import ZoomWebinarService
from students.models import ChatRoom
from students.serializers import ChatRoomSerializer
from students.serializers import MessageSerializer
from students.models import User,Message
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

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
        
        
from rest_framework.permissions import IsAuthenticated

class WebinarListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        webinars = ZoomWebinar.objects.all().order_by('-start_time')
        serializer = ZoomWebinarSerilizer(webinars, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ADMIN CHAT ENDPOINTS (using students app models)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_list_students_with_chats(request):
    """
    List all students who have chat rooms with instructor.
    """
    if request.user.role != 'instructor':
        return Response({'error': 'Only instructors allowed'}, status=403)
    chat_rooms = ChatRoom.objects.filter(name='instructor')
    student_ids = chat_rooms.values_list('created_by', flat=True).distinct()
    students = User.objects.filter(id__in=student_ids)
    data = [
        {
            'id': s.id,
            'username': s.username,
            'first_name': s.first_name,
            'last_name': s.last_name,
            'email': s.email,
        } for s in students
    ]
    return Response({'students': data})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_get_chat_with_student(request, student_id):
    """
    Get chat messages between instructor and a specific student.
    """
    if request.user.role != 'instructor':
        return Response({'error': 'Only instructors allowed'}, status=403)
    try:
        student = User.objects.get(id=student_id, role='student')
    except User.DoesNotExist:
        return Response({'error': 'Student not found'}, status=404)
    chat_room = ChatRoom.objects.filter(created_by=student, name='instructor').first()
    if not chat_room:
        return Response({'messages': []})
    messages = Message.objects.filter(chat_room=chat_room).order_by('created_at')
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_send_message_to_student(request, student_id):
    """
    Instructor sends a message to a specific student.
    """
    if request.user.role != 'instructor':
        return Response({'error': 'Only instructors allowed'}, status=403)
    try:
        student = User.objects.get(id=student_id, role='student')
    except User.DoesNotExist:
        return Response({'error': 'Student not found'}, status=404)
    message_text = request.data.get('message')
    if not message_text:
        return Response({'error': 'Message text is required'}, status=400)
    chat_room, created = ChatRoom.objects.get_or_create(created_by=student, name='instructor')
    message = Message.objects.create(chat_room=chat_room, sender=request.user, message=message_text)
    serializer = MessageSerializer(message)
    return Response(serializer.data, status=status.HTTP_201_CREATED)
