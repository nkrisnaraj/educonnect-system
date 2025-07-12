import hashlib
from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from accounts.models import User
from .models import InstructorProfile, StudyNote
from students.models import StudentProfile
from .serializers import InstructorProfileSerializer, StudyNoteSerializer, ZoomWebinarSerializer
from accounts.serializers import UserSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from edu_admin.models import ZoomWebinar
from django.db.models import Q

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
@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def study_notes(request):
    if request.method == 'GET':
        search_query = request.query_params.get('search', '')
        batch = request.query_params.get('batch', '')

        notes = StudyNote.objects.select_related('related_class').filter(
            Q(title__icontains=search_query) |
            Q(description__icontains=search_query) |
            Q(related_class__topic__icontains=search_query),
            Q(batch__icontains=batch) if batch else Q()
        ).order_by('-upload_date')

        serializer = StudyNoteSerializer(notes, many=True, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = StudyNoteSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(uploaded_by=request.user)
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