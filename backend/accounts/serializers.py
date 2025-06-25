from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from students.models import StudentProfile
from datetime import datetime


User = get_user_model()

class StudentProfileSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = StudentProfile
        fields = ['mobile', 'nic_no', 'address', 'year_of_al', 'school_name']



class UserSerializer(serializers.ModelSerializer):
    student_profile = StudentProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'first_name', 'last_name', 'student_profile']



class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    student_profile = StudentProfileSerializer(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'student_profile']

    def create(self, validated_data):
        # Extract student profile data from the input
        student_profile_data = validated_data.pop('student_profile')
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')

        # Create the User object
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=first_name,
            last_name=last_name,
            role='student'  # Assuming you have a role field
        )
        user.set_password(validated_data['password'])
        user.save()

        # Create or Update StudentProfile
        profile, created = StudentProfile.objects.get_or_create(user=user)

        # Populate profile fields
        profile.mobile = student_profile_data.get('mobile')
        profile.nic_no = student_profile_data.get('nic_no')
        profile.address = student_profile_data.get('address')
        profile.year_of_al = student_profile_data.get('year_of_al')
        profile.school_name = student_profile_data.get('school_name')
        profile.save()

        return user


