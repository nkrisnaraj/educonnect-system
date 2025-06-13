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



#Payment Model
class Payment(models.Model):
    payid = models.CharField(max_length=20, unique=True, blank=True)
    stuid = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    method = models.CharField(max_length=10, choices=[('online', 'Online'), ('receipt', 'Receipt Upload')])
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.payid:
            self.payid = f"PAY-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.stuid.username} - {self.method} - {self.date}"


#Online Payment
class OnlinePayment(models.Model):
    onlinepayid = models.CharField(max_length=20, unique=True, blank=True)
    payid = models.OneToOneField(Payment, on_delete=models.CASCADE)
    invoice_no = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=10, choices=[('success', 'Success'), ('fail', 'Fail')])

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

    def save(self, *args, **kwargs):
        if not self.receiptid:
            self.receiptid = f"RCP-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Receipt by {self.payid.stuid.username} - {'Verified' if self.verified else 'Unverified'}"

