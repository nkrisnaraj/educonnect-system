# serializers.py
from rest_framework import serializers
from .models import Class, InstructorProfile, StudyNote
from django.contrib.auth.models import User
from edu_admin.models import ZoomWebinar

class ClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = ['classid', 'title', 'description', 'fee', 'instructor_name']

class InstructorProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    email = serializers.EmailField(source='user.email')
    username = serializers.CharField(source='user.username')
    profile_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = InstructorProfile
        fields = ['first_name', 'last_name', 'email', 'username', 'phone', 'address', 'profile_image']

    def to_representation(self, instance):
        """Convert the profile_image to an absolute URL."""
        data = super().to_representation(instance)
        request = self.context.get('request')
        if instance.profile_image:
            data['profile_image'] = request.build_absolute_uri(instance.profile_image.url)
        else:
            data['profile_image'] = None
        return data

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})

        for attr, value in user_data.items():
            setattr(instance.user, attr, value)
        instance.user.save()

         # Update profile fields
        for attr, value in validated_data.items():
            if attr == "profile_image" and not value:
                continue 
            setattr(instance, attr, value)
        instance.save()

        return instance

class ZoomWebinarSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZoomWebinar
        fields = ['id', 'topic']  # For displaying available classes

class StudyNoteSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='related_class.topic', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = StudyNote
        fields = ['id', 'title', 'description', 'batch', 'upload_date', 'file_url', 'class_name', 'related_class', 'file']
        read_only_fields = ['upload_date']
        extra_kwargs = {
            'file': {'write_only': True},
            'related_class': {'write_only': True},
        }

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            return request.build_absolute_uri(obj.file.url)
        return None
    
class ClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = ['id', 'classid', 'title', 'description', 'fee']
