import uuid
from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
from students.models import StudentProfile  

# Create your models here.
#class Model
class Class(models.Model):
    classid = models.CharField(max_length=20, unique=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    fee = models.DecimalField(max_digits=10, decimal_places=2)

    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'instructor'}  # corrected: use 'role' instead of 'username'
    )

    def save(self, *args, **kwargs):
        if not self.classid:
            self.classid = f"CRS-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.classid})"


#Exams Model
class Exams(models.Model):
    examid = models.CharField(max_length=20, unique=True)
    examname = models.CharField(max_length=100)
    classid = models.ForeignKey(Class,on_delete=models.CASCADE)
    date = models.DateField()
    
    def __str__(self):
        return f"{self.name} - {self.Class.name}"

#Marks Model
class Marks(models.Model):
    marksid = models.CharField(unique=True, max_length=20)
    stuid = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)
    examid = models.ForeignKey(Exams, on_delete=models.CASCADE)
    marks = models.FloatField()

    def __str__(self):
        return f"{self.stuid.stuid} - {self.examid.examname} - {self.marks}"

class InstructorProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='instructor_profile'
    )
    phone = models.CharField(max_length=10, blank=True)
    address = models.TextField(blank=True)
    profile_image = models.ImageField(upload_to='instructor/', blank=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"