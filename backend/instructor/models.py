import uuid
from django.conf import settings
from django.db import models
from students.models import StudentProfile  




# Create your models here.
#class Model
from multiselectfield import MultiSelectField
import datetime
import calendar
from django.db import models
DAYS = (
    ('Monday', 'Monday'),
    ('Tuesday', 'Tuesday'),
    ('Wednesday', 'Wednesday'),
    ('Thursday', 'Thursday'),
    ('Friday', 'Friday'),
    ('Saturday', 'Saturday'),
    ('Sunday', 'Sunday'),
)
def first_day_of_current_month():
    today = datetime.date.today()
    return today.replace(day=1)

def last_day_of_current_month():
    today = datetime.date.today()
    last_day = calendar.monthrange(today.year, today.month)[1]
    return today.replace(day=last_day)

class Class(models.Model):
    classid = models.CharField(max_length=20, unique=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    fee = models.DecimalField(max_digits=10, decimal_places=2)
    repeat = models.BooleanField(default=True)
    days_of_week = MultiSelectField(choices=DAYS, blank=True, null=True)  # ✅ Can select multiple days
    start_time = models.TimeField(null=True, blank=True)  # e.g. 10:30 AM
    duration_minutes = models.PositiveIntegerField(default=90)  # e.g. 120 minutes = 2 hours
    start_date = models.DateField(default=first_day_of_current_month)
    end_date = models.DateField(default=last_day_of_current_month)


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
