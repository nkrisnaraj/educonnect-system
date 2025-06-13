import uuid
from django.conf import settings
from django.db import models

# Create your models here.
#Course Model
class Course(models.Model):
    courseid = models.CharField(max_length=20, unique=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    fee = models.DecimalField(max_digits=10, decimal_places=2)

    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'instructor'}  # corrected: use 'role' instead of 'username'
    )

    def save(self, *args, **kwargs):
        if not self.courseid:
            self.courseid = f"CRS-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.courseid})"