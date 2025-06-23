from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .serializers import UserSerializer, RegisterSerializer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication 

User = get_user_model()


class StudentDetailView(RetrieveAPIView):
    
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    serializer_class = UserSerializer

    def get_object(self):
        print("User in request:", self.request.user)
        print("Is authenticated:", self.request.user.is_authenticated)
        user = self.request.user
        if not hasattr(user, 'student_profile'):
            raise PermissionDenied("Student profile not found.")
        return user



@api_view(['POST'])
def register_user(request):

    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@api_view(['POST'])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)

    if user:
        tokens = get_tokens_for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "refresh": tokens['refresh'],
            "access": tokens['access']
        }, status=status.HTTP_200_OK)
    return Response({'error': 'Invalid username or password'}, status=status.HTTP_401_UNAUTHORIZED)
