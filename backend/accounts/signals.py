from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import User
from students.models import StudentProfile

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User
from students.models import StudentProfile

@receiver(post_save, sender=User)
def create_student_profile(sender, instance, created, **kwargs):
    if created and instance.role == 'student':
        StudentProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_student_profile(sender, instance, **kwargs):
    if instance.role == 'student':
        instance.studentprofile.save()
