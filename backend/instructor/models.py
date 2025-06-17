<<<<<<< HEAD
from django.db import models

# Create your models here.
=======
import uuid
from django.conf import settings
from django.db import models
from students.models import StudentProfile  




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


#Exams Model
class Exams(models.Model):
    examid = models.CharField(max_length=20, unique=True)
    examname = models.CharField(max_length=100)
    courseid = models.ForeignKey(Course,on_delete=models.CASCADE)
    date = models.DateField()
    
    def __str__(self):
        return f"{self.name} - {self.course.name}"

#Marks Model
class Marks(models.Model):
    marksid = models.CharField(unique=True, max_length=20)
    stuid = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)
    examid = models.CharField(Exams,max_length=100)
    marks = models.FloatField()

    def __str__(self):
        return f"{self.student.stuid} - {self.exam.examname} - {self.marks_obtained}"
    
>>>>>>> 917432b0b93bb150a6cd425d9ac0e03b85e1b17a
