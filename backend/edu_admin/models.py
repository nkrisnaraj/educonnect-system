from django.db import models
from django.conf import settings

# Create your models here.
class ZoomWebinar(models.Model):
    webinar_id = models.CharField(max_length=50, unique=True)
    account_key = models.CharField(max_length=100)
    topic = models.CharField(max_length=255)
    registration_url = models.URLField(null=True, blank=True)
    start_time = models.DateTimeField()
    duration = models.IntegerField()
    agenda = models.TextField(blank=True, null=True)
    is_recurring = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.topic


class ZoomOccurrence(models.Model):
    webinar = models.ForeignKey(ZoomWebinar, related_name='occurrences', on_delete=models.CASCADE)
    occurrence_id = models.CharField(max_length=50)
    start_time = models.DateTimeField()
    duration = models.IntegerField()

    class Meta:
        unique_together = ('webinar', 'occurrence_id')


class ZoomWebinarRegistration(models.Model):
    """Track student registrations for Zoom webinars"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('denied', 'Denied'),
        ('cancelled', 'Cancelled'),
    ]
    
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    webinar = models.ForeignKey(ZoomWebinar, on_delete=models.CASCADE)
    zoom_registrant_id = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    registered_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('student', 'webinar')
    
    def __str__(self):
        return f"{self.student.username} - {self.webinar.topic} ({self.status})"
