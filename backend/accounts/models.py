from django.db import models
from django.contrib.auth.models import AbstractUser


# Extend Django's default user model
class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('instructor', 'Instructor'),
        ('student', 'Student'),
    )

    # class Contact(models.Model):
    # name = models.CharField(max_length=100)
    # email = models.EmailField()
    # subject = models.CharField(max_length=200)
    # message = models.TextField()
    # created_at = models.DateTimeField(default=timezone.now)
    # is_read = models.BooleanField(default=False)
    
    # class Meta:
    #     ordering = ['-created_at']
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')  # auto student for new users

    def __str__(self):
        return f"{self.username} ({self.role})"


import datetime
from django.utils import timezone

class PasswordResetOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        return timezone.now() < self.created_at + timezone.timedelta(minutes=10)