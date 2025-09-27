# serializers.py
from rest_framework import serializers
from .models import Class, ClassSchedule, InstructorProfile, StudyNote, Exam, ExamQuestion, QuestionOption, ExamSubmission, ExamAnswer, Exams
from django.contrib.auth.models import User
from edu_admin.models import ZoomWebinar

# This ClassSerializer is replaced by the more complete one below


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
    class_name = serializers.CharField(source='related_class.title', read_only=True)

    class Meta:
        model = StudyNote
        fields = [
            'id', 'title', 'description', 
            'upload_date', 'class_name',
            'related_class', 'file'
        ]
        read_only_fields = ['upload_date']
        extra_kwargs = {
            'file': {'write_only': True},
            'related_class': {'write_only': True},
        }

    
class ClassScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassSchedule
        fields = ['day_of_week', 'start_time', 'duration_minutes']

class ClassSerializer(serializers.ModelSerializer):
    instructor_name = serializers.SerializerMethodField()
    schedules = serializers.JSONField(required=False)
    status = serializers.SerializerMethodField()
    webinar_info = serializers.SerializerMethodField()

    class Meta:
        model = Class
        fields = [
            'id', 'classid', 'title', 'description', 'fee', 
            'start_date', 'end_date', 'instructor_name', 
            'schedules', 'status', 'webinar_info'
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

    def get_webinar_info(self, obj):
        if obj.webinar:
            return {
                'webinar_id': obj.webinar.webinar_id,
                'topic': obj.webinar.topic,
                'registration_url': obj.webinar.registration_url,
                'start_time': obj.webinar.start_time,
                'duration': obj.webinar.duration,
                'agenda': obj.webinar.agenda
            }
        return None

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


# Enhanced Exam Serializers for Google Forms-style functionality
class QuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionOption
        fields = ['id', 'option_text', 'is_correct', 'order']

class ExamQuestionSerializer(serializers.ModelSerializer):
    options = QuestionOptionSerializer(many=True, required=False)
    
    class Meta:
        model = ExamQuestion
        fields = [
            'id', 'question_text', 'question_type', 'order', 'is_required', 
            'marks', 'description', 'scale_min', 'scale_max', 'scale_min_label', 
            'scale_max_label', 'allow_other_option', 'shuffle_options', 'options'
        ]
    
    def create(self, validated_data):
        options_data = validated_data.pop('options', [])
        question = ExamQuestion.objects.create(**validated_data)
        
        for option_data in options_data:
            QuestionOption.objects.create(question=question, **option_data)
        
        return question
    
    def update(self, instance, validated_data):
        options_data = validated_data.pop('options', [])
        
        # Update question fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update options
        if options_data:
            # Delete existing options
            instance.options.all().delete()
            
            # Create new options
            for option_data in options_data:
                QuestionOption.objects.create(question=instance, **option_data)
        
        return instance

class ExamSerializer(serializers.ModelSerializer):
    questions = ExamQuestionSerializer(many=True, read_only=True)
    class_name = serializers.CharField(source='classid.title', read_only=True)
    instructor_name = serializers.SerializerMethodField()
    questions_count = serializers.ReadOnlyField()
    total_students_attempted = serializers.ReadOnlyField()
    duration_hours = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Exam
        fields = [
            'id', 'examid', 'examname', 'description', 'classid', 'class_name',
            'instructor', 'instructor_name', 'date', 'start_time', 'end_time',
            'duration_minutes', 'duration_hours', 'total_marks', 'passing_marks',
            'status', 'status_display', 'is_published', 'allow_multiple_attempts',
            'shuffle_questions', 'show_results_immediately', 'require_authentication',
            'collect_email', 'confirmation_message', 'created_at', 'updated_at',
            'questions', 'questions_count', 'total_students_attempted'
        ]
        read_only_fields = ['examid', 'created_at', 'updated_at', 'end_time']
    
    def get_instructor_name(self, obj):
        if obj.instructor:
            return f"{obj.instructor.first_name} {obj.instructor.last_name}".strip()
        return "Unknown Instructor"
    
    def get_duration_hours(self, obj):
        hours = obj.duration_minutes // 60
        minutes = obj.duration_minutes % 60
        if hours > 0:
            return f"{hours}h {minutes}m" if minutes > 0 else f"{hours}h"
        return f"{minutes}m"

class ExamListSerializer(serializers.ModelSerializer):
    """Simplified serializer for exam list view"""
    class_name = serializers.CharField(source='classid.title', read_only=True)
    instructor_name = serializers.SerializerMethodField()
    questions_count = serializers.ReadOnlyField()
    total_students_attempted = serializers.ReadOnlyField()
    duration_display = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Exam
        fields = [
            'id', 'examid', 'examname', 'class_name', 'instructor_name',
            'date', 'start_time', 'duration_display', 'total_marks',
            'status', 'status_display', 'is_published', 'questions_count',
            'total_students_attempted', 'created_at'
        ]
    
    def get_instructor_name(self, obj):
        if obj.instructor:
            return f"{obj.instructor.first_name} {obj.instructor.last_name}".strip()
        return "Unknown Instructor"
    
    def get_duration_display(self, obj):
        hours = obj.duration_minutes // 60
        minutes = obj.duration_minutes % 60
        if hours > 0:
            return f"{hours}h {minutes}m" if minutes > 0 else f"{hours}h"
        return f"{minutes}m"

class ExamSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    exam_name = serializers.CharField(source='exam.examname', read_only=True)
    
    class Meta:
        model = ExamSubmission
        fields = [
            'id', 'exam', 'exam_name', 'student', 'student_name',
            'started_at', 'submitted_at', 'is_completed',
            'total_marks_obtained', 'percentage'
        ]
    
    def get_student_name(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}".strip()

class ExamAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    question_type = serializers.CharField(source='question.question_type', read_only=True)
    selected_option_texts = serializers.SerializerMethodField()
    
    class Meta:
        model = ExamAnswer
        fields = [
            'id', 'question', 'question_text', 'question_type',
            'text_answer', 'selected_options', 'selected_option_texts',
            'file_answer', 'numeric_answer', 'date_answer', 'time_answer',
            'is_correct', 'marks_obtained'
        ]
    
    def get_selected_option_texts(self, obj):
        return [option.option_text for option in obj.selected_options.all()]

# Serializer for the old Exams model (backward compatibility)
class OldExamsSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='classid.title', read_only=True)
    
    class Meta:
        model = Exams
        fields = ['id', 'examid', 'examname', 'classid', 'class_name', 'date']
