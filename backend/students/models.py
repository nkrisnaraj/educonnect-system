from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
from django.conf import settings

# Extend Django's default user model


# Student profile model (additional student-only fields)
class StudentProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    mobile = models.CharField(max_length=15)
    nic_no = models.CharField(max_length=15)
    address = models.TextField()
    year_of_al = models.CharField(max_length=10)
    school_name = models.CharField(max_length=100)
    stuid = models.CharField(max_length=20, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.stuid:
            self.stuid = f"STU-{uuid.uuid4().hex[:6].upper()}"  # Auto-generate stuid like STU-3F6A1C
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.stuid}"

