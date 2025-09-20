# serializers.py
from rest_framework import serializers
from .models import Class, ClassSchedule, InstructorProfile, StudyNote
from django.contrib.auth.models import User
from edu_admin.models import ZoomWebinar

class ClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = ['id','classid', 'title', 'description', 'fee', 'instructor_name']


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
    
class ClassScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassSchedule
        fields = ['day_of_week', 'start_time', 'duration_minutes']

class ClassSerializer(serializers.ModelSerializer):
    instructor_name = serializers.SerializerMethodField()
    schedules = serializers.JSONField(required=False)
    status = serializers.SerializerMethodField()

    class Meta:
        model = Class
        fields = [
            'id', 'classid', 'title', 'description', 'fee', 
            'start_date', 'end_date', 'instructor_name', 
            'schedules', 'status'
        ]

    def get_instructor_name(self, obj):
        if obj.instructor:
            return f"{obj.instructor.first_name} {obj.instructor.last_name}".strip()
        return "Auto Assigned"

    def get_status(self, obj):
        # You can add logic here to determine status based on dates, etc.
        from datetime import date
        today = date.today()
        if obj.end_date < today:
            return "completed"
        elif obj.start_date > today:
            return "pending"
        else:
            return "active"

    def to_representation(self, instance):
        """Override to provide proper schedules representation for reading"""
        data = super().to_representation(instance)
        # Group schedules by start_time and duration_minutes for reading
        schedules_dict = {}
        for schedule in instance.schedules.all():
            key = f"{schedule.start_time}_{schedule.duration_minutes}"
            if key not in schedules_dict:
                schedules_dict[key] = {
                    'start_time': schedule.start_time.strftime('%H:%M'),
                    'duration_minutes': schedule.duration_minutes,
                    'days_of_week': []
                }
            schedules_dict[key]['days_of_week'].append(schedule.day_of_week)
        
        data['schedules'] = list(schedules_dict.values())
        return data

    def update(self, instance, validated_data):
        """Handle schedule updates during class update"""
        schedules_data = validated_data.pop('schedules', None)
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle schedule updates if provided
        if schedules_data is not None:
            # Clear existing schedules
            instance.schedules.all().delete()
            
            # Create new schedules
            for schedule_data in schedules_data:
                start_time = schedule_data.get('start_time')
                duration_minutes = schedule_data.get('duration_minutes', 90)
                days_of_week = schedule_data.get('days_of_week', [])
                
                # Create schedule entries for each day
                for day in days_of_week:
                    ClassSchedule.objects.create(
                        class_obj=instance,
                        day_of_week=day,
                        start_time=start_time,
                        duration_minutes=duration_minutes
                    )
        
        return instance
