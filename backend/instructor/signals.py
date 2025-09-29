from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import InstructorNotification, Class, Exam
from students.models import Enrollment, Message
from edu_admin.models import ZoomWebinar, ZoomOccurrence
from students.models import Notification as StudentNotification
import logging

logger = logging.getLogger(__name__)

User = get_user_model()

@receiver(post_save, sender=ZoomWebinar)
def create_webinar_notification(sender, instance, created, **kwargs):
    """Create notification when a new webinar is created"""
    if created:
        # Find all instructors to notify about new webinar
        instructors = User.objects.filter(role='instructor')
        
        for instructor in instructors:
            InstructorNotification.objects.create(
                instructor=instructor,
                title="New Webinar Available",
                message=f"A new webinar '{instance.topic}' has been scheduled for {instance.start_time.strftime('%Y-%m-%d %H:%M')}.",
                type="webinar",
                color="blue"
            )
        logger.info(f"Created webinar notifications for {instructors.count()} instructors")

@receiver(post_save, sender=ZoomOccurrence)
def create_webinar_occurrence_notification(sender, instance, created, **kwargs):
    """Create notification when a new webinar occurrence is created"""
    if created:
        # Find all instructors to notify about new webinar occurrence
        instructors = User.objects.filter(role='instructor')
        
        for instructor in instructors:
            InstructorNotification.objects.create(
                instructor=instructor,
                title="New Webinar Session",
                message=f"A new session for webinar '{instance.webinar.topic}' is scheduled for {instance.start_time.strftime('%Y-%m-%d %H:%M')}.",
                type="webinar",
                color="blue"
            )
        logger.info(f"Created webinar occurrence notifications for {instructors.count()} instructors")

@receiver(post_save, sender=Class)
def create_class_notification(sender, instance, created, **kwargs):
    """Create notification when a new class is created"""
    if created:
        InstructorNotification.objects.create(
            instructor=instance.instructor,
            title="New Class Created",
            message=f"Your new class '{instance.title}' has been created successfully. Class ID: {instance.classid}",
            type="class",
            color="green"
        )
        logger.info(f"Created class notification for instructor {instance.instructor.username}")

@receiver(post_save, sender=Exam)
def create_exam_notification(sender, instance, created, **kwargs):
    """Create notification when a new exam is created"""
    if created:
        try:
            InstructorNotification.objects.create(
                instructor=instance.instructor,
                title="New Exam Created",
                message=f"New exam '{instance.examname}' has been created for class '{instance.classid.title}'. Scheduled for {instance.date.strftime('%Y-%m-%d')} at {instance.start_time.strftime('%H:%M')}.",
                type="exam",
                color="yellow"
            )
            logger.info(f"Created exam notification for instructor {instance.instructor.username}")
            print(f"✅ Created exam notification for instructor {instance.instructor.username}")
        except Exception as e:
            logger.error(f"Failed to create exam notification: {e}")
            print(f"❌ Failed to create exam notification: {e}")

@receiver(post_save, sender=Enrollment)
def create_enrollment_notification(sender, instance, created, **kwargs):
    """Create notification when a new student enrolls in a class"""
    if created:
        # Get the instructor of the class
        instructor = instance.classid.instructor
        
        InstructorNotification.objects.create(
            instructor=instructor,
            title="New Student Enrollment",
            message=f"Student {instance.stuid.user.first_name} {instance.stuid.user.last_name} has enrolled in your class '{instance.classid.title}'.",
            type="enrollment",
            color="green"
        )
        logger.info(f"Created enrollment notification for instructor {instructor.username}")

@receiver(post_save, sender=Message)
def create_message_notification(sender, instance, created, **kwargs):
    """Create notification when a student sends a message to instructor"""
    if created and instance.sender.role == 'student':
        print(f"📨 Message created by student: {instance.sender.username}")
        # Check if this is a message to an instructor (chat room name is 'instructor')
        if instance.chat_room.name == 'instructor':
            print(f"📨 Message is for instructor chat room")
            # Find the instructor associated with this student
            # We need to find the instructor whose class the student is enrolled in
            student_enrollments = Enrollment.objects.filter(stuid__user=instance.sender)
            print(f"📨 Found {student_enrollments.count()} enrollments for student")
            
            for enrollment in student_enrollments:
                instructor = enrollment.classid.instructor
                print(f"📨 Creating notification for instructor: {instructor.username}")
                
                try:
                    InstructorNotification.objects.create(
                        instructor=instructor,
                        title="New Message from Student",
                        message=f"Student {instance.sender.first_name} {instance.sender.last_name} sent you a message: '{instance.content[:50]}{'...' if len(instance.content) > 50 else ''}'",
                        type="message",
                        color="purple"
                    )
                    print(f"✅ Created message notification for instructor {instructor.username}")
                except Exception as e:
                    print(f"❌ Failed to create message notification: {e}")
            logger.info(f"Created message notification for instructors")
        else:
            print(f"📨 Message is not for instructor chat room: {instance.chat_room.name}")
    else:
        print(f"📨 Message not created by student or not new: created={created}, sender_role={getattr(instance.sender, 'role', 'unknown')}")

@receiver(post_save, sender=StudentNotification)
def create_student_notification_forward(sender, instance, created, **kwargs):
    """Create notification when a student notification is created (for other types)"""
    if created and instance.type == 'message':
        # Find the instructor associated with this student
        # We need to find the instructor whose class the student is enrolled in
        student_enrollments = Enrollment.objects.filter(stuid=instance.student_id)
        
        for enrollment in student_enrollments:
            instructor = enrollment.classid.instructor
            
            InstructorNotification.objects.create(
                instructor=instructor,
                title="New Message from Student",
                message=f"Student {instance.student_id.user.first_name} {instance.student_id.user.last_name} sent you a message: '{instance.title}'",
                type="message",
                color="purple"
            )
        logger.info(f"Created message notification for instructors")

@receiver(post_save, sender=Exam)
def update_exam_status_notification(sender, instance, **kwargs):
    """Create notification when exam status changes"""
    if not kwargs.get('created', False):  # Only for updates, not creation
        # Check if status changed to published
        if hasattr(instance, '_original_status') and instance._original_status != 'published' and instance.status == 'published':
            # Create instructor notification
            InstructorNotification.objects.create(
                instructor=instance.instructor,
                title="Exam Published",
                message=f"Your exam '{instance.examname}' for class '{instance.classid.title}' has been published and is now available to students.",
                type="exam",
                color="green"
            )
            logger.info(f"Created exam published notification for instructor {instance.instructor.username}")
            
            # Create student notifications for all enrolled students in the class
            try:
                if not instance.classid:
                    logger.warning(f"Exam {instance.examname} has no associated class, skipping student notifications")
                    return
                    
                enrolled_students = Enrollment.objects.filter(classid=instance.classid).select_related('stuid')
                student_notifications_created = 0
                
                logger.info(f"Found {enrolled_students.count()} enrolled students for class {instance.classid.title}")
                
                for enrollment in enrolled_students:
                    try:
                        StudentNotification.objects.create(
                            student_id=enrollment.stuid,
                            title="New Exam Available",
                            message=f"A new exam '{instance.examname}' has been published for class '{instance.classid.title}'. Duration: {instance.duration_minutes} minutes. Due date: {instance.date.strftime('%Y-%m-%d')} at {instance.start_time.strftime('%H:%M')}",
                            type="exam"
                        )
                        student_notifications_created += 1
                        logger.debug(f"Created notification for student {enrollment.stuid.user.username}")
                    except Exception as e:
                        logger.error(f"Failed to create notification for student {enrollment.stuid}: {e}")
                        
                logger.info(f"✅ Created {student_notifications_created} student notifications for published exam '{instance.examname}'")
                print(f"✅ Created {student_notifications_created} student notifications for published exam '{instance.examname}'")
                
            except Exception as e:
                logger.error(f"❌ Error creating student notifications for published exam '{instance.examname}': {e}")
                print(f"❌ Error creating student notifications for published exam '{instance.examname}': {e}")

def custom_exam_init(self, *args, **kwargs):
    super(Exam, self).__init__(*args, **kwargs)
    # Store original status for comparison
    self._original_status = self.status

# Override save method to track status changes
def custom_exam_save(self, *args, **kwargs):
    # Store original status before saving
    if self.pk:
        try:
            original = Exam.objects.get(pk=self.pk)
            self._original_status = original.status
        except Exam.DoesNotExist:
            self._original_status = None
    else:
        self._original_status = None
    
    super(Exam, self).save(*args, **kwargs)

# Monkey patch the save method
Exam.__init__ = custom_exam_init
Exam.save = custom_exam_save
