from django.db import models
from django.contrib.auth.models import AbstractUser


# Extend Django's default user model
class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('instructor', 'Instructor'),
        ('student', 'Student'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')  # auto student for new users

    def __str__(self):
        return f"{self.username} ({self.role})"
