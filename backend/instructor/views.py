import hashlib
from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from accounts.models import User
from .models import InstructorProfile
from students.models import StudentProfile
from .serializers import InstructorProfileSerializer
from accounts.serializers import UserSerializer
from rest_framework.parsers import MultiPartParser, FormParser

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
    
