from rest_framework import serializers
from .models import Class, InstructorProfile
from django.contrib.auth.models import User

class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.CharField(source='instructor.username', read_only=True)

    class Meta:
        model = Class
        fields = ['classid', 'title', 'description', 'fee', 'instructor_name']

class InstructorProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    email = serializers.EmailField(source='user.email')
    username = serializers.CharField(source='user.username')
    profile_image = serializers.ImageField(required=False)

    class Meta:
        model = InstructorProfile
        fields = ['first_name', 'last_name', 'email', 'username', 'phone', 'address', 'profile_image']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})

        for attr, value in user_data.items():
            setattr(instance.user, attr, value)
        instance.user.save()

         # Update profile fields
        for attr, value in validated_data.items():
            if attr == "profile_image" and not value:
                continue  # Skip if no new image uploaded
            setattr(instance, attr, value)
        instance.save()

        return instance
    