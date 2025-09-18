# Enhanced models for exam system with question types like Google Forms
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

# Question Types for Google Forms-style functionality
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

# Enhanced Exam Model
class Exam(models.Model):
    examid = models.CharField(max_length=20, unique=True, blank=True)
    examname = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    classid = models.ForeignKey('Class', on_delete=models.CASCADE)
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
    
    # Settings inspired by Google Forms
    is_published = models.BooleanField(default=False)
    allow_multiple_attempts = models.BooleanField(default=False)
    shuffle_questions = models.BooleanField(default=False)
    show_results_immediately = models.BooleanField(default=True)
    require_authentication = models.BooleanField(default=True)
    collect_email = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Google Forms-style settings
    confirmation_message = models.TextField(
        default="Thank you for submitting your exam. Your responses have been recorded.",
        blank=True
    )
    
    def save(self, *args, **kwargs):
        if not self.examid:
            self.examid = f"EXM-{uuid.uuid4().hex[:6].upper()}"
        
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
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    order = models.PositiveIntegerField(default=0)
    
    # Validation
    is_required = models.BooleanField(default=True)
    marks = models.PositiveIntegerField(default=1)
    
    # For specific question types
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
    
    def calculate_score(self):
        """Calculate the total score for this submission"""
        answers = self.answers.all()
        total_marks = 0
        
        for answer in answers:
            if answer.is_correct:
                total_marks += answer.question.marks
        
        self.total_marks_obtained = total_marks
        if self.exam.total_marks > 0:
            self.percentage = (total_marks / self.exam.total_marks) * 100
        self.save()
        
        return total_marks

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
    
    def check_answer(self):
        """Auto-check answer for objective questions"""
        if self.question.question_type == 'multiple_choice':
            correct_options = self.question.options.filter(is_correct=True)
            selected_options = self.selected_options.all()
            
            if (selected_options.count() == 1 and 
                correct_options.count() == 1 and 
                selected_options.first() in correct_options):
                self.is_correct = True
                self.marks_obtained = self.question.marks
            else:
                self.is_correct = False
                self.marks_obtained = 0
                
        elif self.question.question_type == 'multiple_select':
            correct_options = set(self.question.options.filter(is_correct=True))
            selected_options = set(self.selected_options.all())
            
            if correct_options == selected_options:
                self.is_correct = True
                self.marks_obtained = self.question.marks
            else:
                self.is_correct = False
                self.marks_obtained = 0
                
        elif self.question.question_type == 'true_false':
            correct_option = self.question.options.filter(is_correct=True).first()
            selected_option = self.selected_options.first()
            
            if correct_option and selected_option == correct_option:
                self.is_correct = True
                self.marks_obtained = self.question.marks
            else:
                self.is_correct = False
                self.marks_obtained = 0
        
        self.save()
        return self.is_correct