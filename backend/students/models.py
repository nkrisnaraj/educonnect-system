from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
from django.conf import settings
from django.utils import timezone
from django.contrib.postgres.fields import ArrayField

# Student profile model (additional student-only fields)
class StudentProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,related_name='student_profile')
    mobile = models.CharField(max_length=15)
    nic_no = models.CharField(max_length=15,unique=True)
    address = models.TextField()
    city = models.CharField(max_length=50, blank=True, null=True)
    district = models.CharField(max_length=50, blank=True, null=True)
    year_of_al = models.CharField()
    school_name = models.CharField(max_length=100)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    stuid = models.CharField(max_length=20, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.stuid:
            self.stuid = f"STU-{uuid.uuid4().hex[:6].upper()}"  # Auto-generate stuid like STU-3F6A1C
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.stuid}"


#Payment Model
class Payment(models.Model):
    payid = models.CharField(max_length=20, unique=True, blank=True)
    stuid = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    method = models.CharField(max_length=10, choices=[('online', 'Online'), ('receipt', 'Receipt Upload')])
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20,choices=[('success', 'Success'), ('fail', 'Fail'), ('pending' , 'Pending')], default='pending')

    def save(self, *args, **kwargs):
        if not self.payid:
            self.payid = f"PAY-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.stuid.username} - {self.method} - {self.date}"
    
from django.db import models
from django.contrib.auth import get_user_model
User = get_user_model()

class PaymentTest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    order_id = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10)
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.order_id} - {self.status}"

#Online Payment
class OnlinePayment(models.Model):
    onlinepayid = models.CharField(max_length=20, unique=True, blank=True)
    payid = models.OneToOneField(Payment, on_delete=models.CASCADE)
    invoice_no = models.CharField(max_length=100, unique=True)
    #status = models.CharField(max_length=10, choices=[('success', 'Success'), ('fail', 'Fail')])
    verified = models.BooleanField(default=False)
    # course_ids = ArrayField(models.IntegerField(), blank=True, default=list)
    course_ids = models.JSONField(blank=True, null=True)  
    course_summary = models.TextField(blank=True, null=True)
    initiated_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.onlinepayid:
            self.onlinepayid = f"ONP-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Invoice: {self.invoice_no} - {self.status}"


#Receipt Payment
class ReceiptPayment(models.Model):
    receiptid = models.CharField(max_length=20, unique=True, blank=True)
    payid = models.OneToOneField(Payment, on_delete=models.CASCADE)
    image_url = models.ImageField(upload_to='receipts/')
    verified = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    record_no = models.CharField(null=True, blank=True, max_length=100)
    paid_date_time = models.DateTimeField(null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    paid_amount = models.CharField(max_length=100, null=True, blank=True)
    account_no = models.CharField(max_length=50, null=True, blank=True)
    account_name = models.CharField(max_length=255, null=True, blank=True)


    def save(self, *args, **kwargs):
        if not self.receiptid:
            self.receiptid = f"RCP-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Receipt by {self.payid.stuid.username} - {'Verified' if self.verified else 'Unverified'}"


#Enrollment Model
class Enrollment(models.Model):
    enrollid = models.AutoField(primary_key=True)
    stuid = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE)
    classid = models.ForeignKey('instructor.Class', on_delete=models.CASCADE)
    payid = models.ForeignKey('students.Payment', on_delete=models.CASCADE, null=True, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Enrollment {self.enrollid} - Student {self.stuid} in Class {self.classid}"



class CalendarEvent(models.Model):
    EVENT_TYPES = [
        ('webinar', 'Webinar'),
        ('notes', 'Notes Uploaded'),
        ('exam', 'Exam Scheduled'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    date = models.DateField()
    time = models.TimeField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    classid = models.ForeignKey("instructor.Class", on_delete=models.CASCADE, related_name="calendar_events")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.classid.title} - {self.date}"


class ChatRoom(models.Model):
    name = models.CharField(max_length=255)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chatrooms_created')
    created_at = models.DateTimeField(auto_now_add=True)

class Message(models.Model):
    chat_room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages_sent')
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read_status = models.BooleanField(default=False)