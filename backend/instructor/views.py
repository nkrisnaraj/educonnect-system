import hashlib
from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from accounts.models import User
from .models import InstructorProfile, StudyNote, Class
from students.models import StudentProfile
from .serializers import InstructorProfileSerializer, StudyNoteSerializer, ZoomWebinarSerializer, ClassSerializer
from accounts.serializers import UserSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from edu_admin.models import ZoomWebinar
from django.db.models import Q
from students.models import ChatRoom,Message
from students.serializers import MessageSerializer
from students.models import StudentProfile

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

@api_view(['GET', 'PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def instructor_profile(request):
    profile, _ = InstructorProfile.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        serializer = InstructorProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = InstructorProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully.", "data": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# List and Upload Notes
from students.models import Notification,Enrollment
@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def study_notes(request):
    if request.method == 'GET':
        search_query = request.query_params.get('search', '')
        related_class = request.query_params.get('related_class')

        notes = StudyNote.objects.select_related('related_class').filter(
            Q(title__icontains=search_query) |
            Q(description__icontains=search_query) |
            Q(related_class__topic__icontains=search_query),
        ).order_by('-upload_date')

        if related_class and related_class.lower() != 'all':
            notes = notes.filter(related_class__id=related_class)

        serializer = StudyNoteSerializer(notes, many=True, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = StudyNoteSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            note = serializer.save(uploaded_by=request.user)
            # Notification logic starts here
            related_class = note.related_class
            enrollments = Enrollment.objects.filter(classid = related_class).select_related('stuid')
            for enrollment in enrollments:
                student_profile = enrollment.stuid
                Notification.objects.create(
                    student_id=student_profile,
                    title=note.title,
                    message=f"A new note '{note.title}' was uploaded for {related_class.topic}.",
                    type="notes"
                )

            return Response({"message": "Note uploaded successfully.", "data": serializer.data}, status=status.HTTP_201_CREATED)
               
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Retrieve, Update, Delete Single Note
@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def study_note_detail(request, pk):
    try:
        note = StudyNote.objects.select_related('related_class').get(pk=pk)
    except StudyNote.DoesNotExist:
        return Response({'error': 'Study Note not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = StudyNoteSerializer(note, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = StudyNoteSerializer(note, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Note updated successfully.", "data": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        note.delete()
        return Response({"message": "Note deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


# List all class topics
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def webinar_classes(request):
    webinars = ZoomWebinar.objects.all().order_by('topic')
    serializer = ZoomWebinarSerializer(webinars, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def instructor_classes(request):
    classes = Class.objects.filter(instructor=request.user)
    serializer = ClassSerializer(classes, many=True)
    return Response({"classes": serializer.data})

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
    # 1. Check if the user is an instructor
    if request.user.role != 'instructor':
        return Response({'error': 'Only instructors allowed'}, status=403)

    # 2. Validate the student user
    try:
        student = User.objects.get(id=student_id, role='student')
    except User.DoesNotExist:
        return Response({'error': 'Student not found'}, status=404)
    print(f"Checking StudentProfile for user: {student.username} (ID: {student.id})")
    # 3. Safely access the student profile
    try:
        student_profile = StudentProfile.objects.get(user=student)
    except StudentProfile.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=404)

    # 4. Get message text
    message_text = request.data.get('message')
    if not message_text:
        return Response({'error': 'Message text is required'}, status=400)

    # 5. Create or get chat room (optional: filter more uniquely if needed)
    chat_room, created = ChatRoom.objects.get_or_create(created_by=student, name='instructor')

    # 6. Create the message
    message = Message.objects.create(chat_room=chat_room, sender=request.user, message=message_text)

    # 7. Create the notification for the specific student
    Notification.objects.create(
        student_id=student_profile,
        title="New message from instructor",
        message=message_text,
        type='message'
    )

    # 8. Return the message
    serializer = MessageSerializer(message)
    return Response(serializer.data, status=status.HTTP_201_CREATED)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_messages_read(request, student_id):
    if request.user.role != 'instructor':
        return Response({'error': 'Only instructors allowed'}, status=403)

    student = User.objects.filter(id=student_id, role='student').first()
    if not student:
        return Response({'error': 'Student not found'}, status=404)

    chat_room = ChatRoom.objects.filter(created_by=student, name='instructor').first()
    if not chat_room:
        return Response({'error': 'No chat room'}, status=404)

    # Mark messages from student to instructor as read
    Message.objects.filter(
        chat_room=chat_room,
        sender=student,
        is_seen=False
    ).update(is_seen=True)

    return Response({'status': 'ok'})