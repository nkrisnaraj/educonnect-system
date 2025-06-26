from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User
from students.models import StudentProfile
# from instructor.models import InstructorProfile
# from edu_admin.models import EduAdminProfile

#@receiver(post_save, sender=User)
#def create_profile(sender, instance, created, **kwargs):
    #if created:
        #if instance.role == 'student':
            #StudentProfile.objects.create(user=instance)
        # elif instance.role == 'instructor':
        #     InstructorProfile.objects.create(user=instance)
        # elif instance.role == 'admin':
        #     EduAdminProfile.objects.create(user=instance)
