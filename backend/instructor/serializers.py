from rest_framework import serializers
from .models import Class

class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.CharField(source='instructor.username', read_only=True)

    class Meta:
        model = Class
        fields = ['classid', 'title', 'description', 'fee', 'instructor_name']