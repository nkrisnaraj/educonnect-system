from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from accounts.models import User
from students.models import StudentProfile
from accounts.serializers import UserSerializer
from students.models import ChatRoom, Message
from students.serializers import MessageSerializer
from django.db.models import Q
from django.contrib.auth import get_user_model
User = get_user_model()
from rest_framework import status
from students.models import ChatRoom
from students.serializers import ChatRoomSerializer


# Create your views here.
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_all_students(request):
    if request.user.role != 'instructor':
        return Response({'detail': 'You do not have permission to perform this action.'}, status=403)
    
    students = User.objects.filter(role='student').select_related('student_profile')
    data = []

    for student in students:
        profile = getattr(student, 'student_profile', None)
        data.append({
            "id": student.id,
            "first_name": student.first_name,
            "last_name": student.last_name,
            "email": student.email,
            "student_profile": {
            "phone": profile.mobile if profile else "",
            "school":  profile.school_name if profile else "",
            "address": profile.address if profile else "",
            "year_of_al": profile.year_of_al if profile else "",
            }
        })

    return Response({"students": data})



# INSTRUCTOR CHAT ENDPOINTS (using students app models)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def instructor_list_students_with_chats(request):
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
def instructor_get_chat_with_student(request, student_id):
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
def instructor_send_message_to_student(request, student_id):
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
