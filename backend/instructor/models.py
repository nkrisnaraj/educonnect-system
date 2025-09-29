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

# Enhanced Exams Model with Google Forms-style functionality
class Exam(models.Model):
    QUESTION_TYPES = (
        ('multiple_choice', 'Multiple Choice'),
        ('multiple_select', 'Multiple Select'),
        ('short_answer', 'Short Answer'),
        ('paragraph', 'Paragraph'),
        ('true_false', 'True/False'),
        ('rating_scale', 'Rating Scale'),
        ('linear_scale', 'Linear Scale'),
        ('dropdown', 'Dropdown'),
        ('file_upload', 'File Upload'),
        ('date', 'Date'),
        ('time', 'Time'),
    )

    EXAM_STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('scheduled', 'Scheduled'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('archived', 'Archived'),
    )

    examid = models.CharField(max_length=20, unique=True, blank=True)
    examname = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    classid = models.ForeignKey(Class, on_delete=models.CASCADE)
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'instructor'}
    )
    
    # Scheduling
    date = models.DateField()
    start_time = models.TimeField()
    duration_minutes = models.PositiveIntegerField(default=60)
    end_time = models.TimeField(blank=True, null=True)
    
    # Configuration
    total_marks = models.PositiveIntegerField(default=100)
    passing_marks = models.PositiveIntegerField(default=50)
    status = models.CharField(max_length=20, choices=EXAM_STATUS_CHOICES, default='draft')
    
    # Google Forms-style settings
    is_published = models.BooleanField(default=False)
    allow_multiple_attempts = models.BooleanField(default=False)
    shuffle_questions = models.BooleanField(default=False)
    show_results_immediately = models.BooleanField(default=True)
    require_authentication = models.BooleanField(default=True)
    collect_email = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    confirmation_message = models.TextField(
        default="Thank you for submitting your exam. Your responses have been recorded.",
        blank=True
    )
    
    def save(self, *args, **kwargs):
        # Generate examid if it's None, empty string, or whitespace
        if not self.examid or self.examid.strip() == '':
            # Generate a unique examid
            import random
            while True:
                new_examid = f"EXM-{uuid.uuid4().hex[:6].upper()}"
                # Check if this examid already exists
                if not Exam.objects.filter(examid=new_examid).exists():
                    self.examid = new_examid
                    break
        
        # Calculate end time if not provided
        if not self.end_time and self.start_time and self.duration_minutes:
            start_datetime = datetime.datetime.combine(datetime.date.today(), self.start_time)
            end_datetime = start_datetime + datetime.timedelta(minutes=self.duration_minutes)
            self.end_time = end_datetime.time()
            
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.examname} - {self.classid.classid}"
    
    @property
    def questions_count(self):
        return self.questions.count()
    
    @property
    def total_students_attempted(self):
        return ExamSubmission.objects.filter(exam=self).values('student').distinct().count()

# Question Model for Google Forms-style questions
class ExamQuestion(models.Model):
    exam = models.ForeignKey(Exam, related_name='questions', on_delete=models.CASCADE)
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=Exam.QUESTION_TYPES)
    order = models.PositiveIntegerField(default=0)
    
    # Validation
    is_required = models.BooleanField(default=True)
    marks = models.PositiveIntegerField(default=1)
    
    # Additional fields
    description = models.TextField(blank=True, help_text="Additional description or instructions")
    
    # For rating/linear scales
    scale_min = models.PositiveIntegerField(default=1, null=True, blank=True)
    scale_max = models.PositiveIntegerField(default=5, null=True, blank=True)
    scale_min_label = models.CharField(max_length=50, blank=True)
    scale_max_label = models.CharField(max_length=50, blank=True)
    
    # Settings
    allow_other_option = models.BooleanField(default=False)
    shuffle_options = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.exam.examname} - Q{self.order}: {self.question_text[:50]}"

# Answer Options for multiple choice, dropdown, etc.
class QuestionOption(models.Model):
    question = models.ForeignKey(ExamQuestion, related_name='options', on_delete=models.CASCADE)
    option_text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.question.question_text[:30]} - {self.option_text}"

# Student Exam Submissions
class ExamSubmission(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)
    
    # Submission details
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    
    # Scoring
    total_marks_obtained = models.FloatField(default=0)
    percentage = models.FloatField(default=0)
    
    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    class Meta:
        unique_together = ['exam', 'student']
    
    def __str__(self):
        return f"{self.student.stuid} - {self.exam.examname}"

# Student Answers
class ExamAnswer(models.Model):
    submission = models.ForeignKey(ExamSubmission, related_name='answers', on_delete=models.CASCADE)
    question = models.ForeignKey(ExamQuestion, on_delete=models.CASCADE)
    
    # Different answer types
    text_answer = models.TextField(blank=True)
    selected_options = models.ManyToManyField(QuestionOption, blank=True)
    file_answer = models.FileField(upload_to='exam_answers/', blank=True, null=True)
    numeric_answer = models.FloatField(null=True, blank=True)
    date_answer = models.DateField(null=True, blank=True)
    time_answer = models.TimeField(null=True, blank=True)
    
    # Grading
    is_correct = models.BooleanField(default=False)
    marks_obtained = models.FloatField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.submission.student.stuid} - {self.question.question_text[:30]}"

# Keep the old Exams model for backward compatibility
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
    file = models.FileField(upload_to='study_notes')
    upload_date = models.DateField(auto_now_add=True)

    # Relations
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    related_class = models.ForeignKey(Class, on_delete=models.CASCADE, related_name="notes")

    def __str__(self):
        return f"{self.title} ({self.related_class.title})"

class InstructorNotification(models.Model):
    TYPE_CHOICES = [
        ("webinar", "Webinar"),
        ("class", "Class"),
        ("exam", "Exam"),
        ("message", "Message"),
        ("enrollment", "Enrollment"),
        ("system", "System"),
    ]

    COLOR_CHOICES = [
        ("blue", "Blue"),
        ("green", "Green"),
        ("yellow", "Yellow"),
        ("red", "Red"),
        ("purple", "Purple"),
        ("gray", "Gray"),
    ]

    id = models.AutoField(primary_key=True)
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="instructor_notifications"
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="system")
    read = models.BooleanField(default=False)
    color = models.CharField(max_length=20, choices=COLOR_CHOICES, default="blue")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.type})"


