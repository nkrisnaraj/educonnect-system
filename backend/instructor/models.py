import uuid
from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
from students.models import StudentProfile  
from edu_admin.models import ZoomWebinar 
import datetime
import calendar
from edu_admin.models import ZoomWebinar
from students.models import StudentProfile

# Weekdays choices
DAYS = (
    ('Monday', 'Monday'),
    ('Tuesday', 'Tuesday'),
    ('Wednesday', 'Wednesday'),
    ('Thursday', 'Thursday'),
    ('Friday', 'Friday'),
    ('Saturday', 'Saturday'),
    ('Sunday', 'Sunday'),
)

# Utility functions
def first_day_of_current_month():
    today = datetime.date.today()
    return today.replace(day=1)

def last_day_of_current_month():
    today = datetime.date.today()
    last_day = calendar.monthrange(today.year, today.month)[1]
    return today.replace(day=last_day)

# Class Model
class Class(models.Model):
    classid = models.CharField(max_length=20, unique=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    fee = models.DecimalField(max_digits=10, decimal_places=2)
    repeat = models.BooleanField(default=True)
    start_date = models.DateField(default=first_day_of_current_month)
    end_date = models.DateField(default=last_day_of_current_month)

    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'instructor'}
    )
    webinar = models.ForeignKey(ZoomWebinar, on_delete=models.SET_NULL, null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.classid:
            self.classid = f"CRS-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.classid})"

# Class Schedule Model
class ClassSchedule(models.Model):
    class_obj = models.ForeignKey(Class, related_name='schedules', on_delete=models.CASCADE)
    day_of_week = models.CharField(max_length=9, choices=DAYS)
    start_time = models.TimeField()
    duration_minutes = models.PositiveIntegerField(default=90)

    def __str__(self):
        return f"{self.class_obj.classid} - {self.day_of_week} {self.start_time}"

# Exams Model
class Exams(models.Model):
    examid = models.CharField(max_length=20, unique=True)
    examname = models.CharField(max_length=100)
    classid = models.ForeignKey(Class, on_delete=models.CASCADE)
    date = models.DateField()
    
    def __str__(self):
        return f"{self.examname} - {self.classid.classid}"

# Marks Model
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

class StudyNote(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    batch = models.CharField(max_length=50)
    file = models.FileField(upload_to='study_notes')
    upload_date = models.DateField(auto_now_add=True)

    # Relations
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    related_class = models.ForeignKey(Class, on_delete=models.CASCADE, related_name="notes")

    def __str__(self):
        return f"{self.title} ({self.related_class.title})"

