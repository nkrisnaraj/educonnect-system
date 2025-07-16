from rest_framework import serializers
from .models import Class

class ClassSerializer(serializers.ModelSerializer):
    instructor_name = serializers.CharField(source='instructor.username', read_only=True)

    class Meta:
        model = Class
        fields = ['id','classid', 'title', 'description', 'fee', 'instructor_name']

