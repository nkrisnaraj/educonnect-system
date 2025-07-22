from django.db.models.signals import post_save
from django.dispatch import receiver
from edu_admin.models import  ZoomWebinar, ZoomOccurrence 
from instructor.models import Exams
from students.models import CalendarEvent

@receiver(post_save, sender=Exams)
def create_exam_event(sender, instance, created, **kwargs):
    if created:
        CalendarEvent.objects.create(
            title=instance.examname,
            type='exam',
            date=instance.date,
            related_exam=instance,
            color='blue'
        )

@receiver(post_save, sender=ZoomWebinar)
def create_webinar_event(sender, instance, created, **kwargs):
    if created and not instance.is_recurring:
        CalendarEvent.objects.create(
            title=instance.topic,
            type='webinar',
            date=instance.start_time,
            related_webinar=instance,
            color='yellow'
        )

# @receiver(post_save, sender=ZoomOccurrence)
# def create_webinar_occurrence_event(sender, instance, created, **kwargs):
#     if created:
#         CalendarEvent.objects.create(
#             title=instance.webinar.topic,
#             type='webinar',
#             date=instance.start_time,
#             related_webinar=instance.webinar,
#             color='yellow'
#         )
