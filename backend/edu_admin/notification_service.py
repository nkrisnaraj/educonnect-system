# Notification Service for Webinar Registration and Approval
# This module handles sending notifications to students when they are registered and approved for webinars

from students.models import Notification, StudentProfile
from django.contrib.auth import get_user_model
from django.utils import timezone
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class WebinarNotificationService:
    """Service class to handle webinar-related notifications"""
    
    @staticmethod
    def send_webinar_registration_notification(student_user, webinar_topic, webinar_id, payment_id=None):
        """
        Send notification when student is registered for a webinar
        
        Args:
            student_user: User object of the student
            webinar_topic: String - topic/name of the webinar
            webinar_id: String - Zoom webinar ID
            payment_id: String - payment ID if available
        """
        try:
            # Get student profile
            try:
                student_profile = StudentProfile.objects.get(user=student_user)
            except StudentProfile.DoesNotExist:
                logger.error(f"Student profile not found for user: {student_user.username}")
                return False
            
            # Create notification title and message
            title = f"🎥 Webinar Registration Successful"
            
            message_parts = [
                f"You have been successfully registered for the webinar: '{webinar_topic}'",
                f"Webinar ID: {webinar_id}",
            ]
            
            # if payment_id:
            #     message_parts.append(f"Payment ID: {payment_id}")
            
            message_parts.extend([
                "Your registration is currently pending approval.",
                "You will receive another notification once approved.",
                "Thank you for your enrollment!"
            ])
            
            message = "\n\n".join(message_parts)
            
            # Create notification
            notification = Notification.objects.create(
                student_id=student_profile,
                title=title,
                message=message,
                type='webinar',
                read_status=False,
                created_at=timezone.now()
            )
            
            logger.info(f"✅ Registration notification sent to {student_user.username} for webinar {webinar_topic}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to send registration notification to {student_user.username}: {e}")
            return False
    
    @staticmethod
    def send_webinar_approval_notification(student_user, webinar_topic, webinar_id, join_url=None, payment_id=None):
        """
        Send notification when student's webinar registration is approved
        
        Args:
            student_user: User object of the student
            webinar_topic: String - topic/name of the webinar
            webinar_id: String - Zoom webinar ID
            join_url: String - Zoom join URL (if available)
            payment_id: String - payment ID if available
        """
        try:
            # Get student profile
            try:
                student_profile = StudentProfile.objects.get(user=student_user)
            except StudentProfile.DoesNotExist:
                logger.error(f"Student profile not found for user: {student_user.username}")
                return False
            
            # Create notification title and message
            title = f"🎉 Webinar Approved - Ready to Join!"
            
            message_parts = [
                f"Great news! Your registration for '{webinar_topic}' has been approved.",
                f"Webinar ID: {webinar_id}",
            ]
            
            # if payment_id:
            #     message_parts.append(f"Payment ID: {payment_id}")
            
            if join_url:
                message_parts.extend([
                    "You can now join the webinar using the link below:",
                    f"Join URL: {join_url}",
                ])
            else:
                message_parts.append("You will receive the join link shortly before the webinar starts.")
            
            message_parts.extend([
                "Please save this information for your records.",
                "We look forward to seeing you in the webinar!"
            ])
            
            message = "\n\n".join(message_parts)
            
            # Create notification
            notification = Notification.objects.create(
                student_id=student_profile,
                title=title,
                message=message,
                type='webinar',
                read_status=False,
                created_at=timezone.now()
            )
            
            logger.info(f"✅ Approval notification sent to {student_user.username} for webinar {webinar_topic}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to send approval notification to {student_user.username}: {e}")
            return False
    
    @staticmethod
    def send_webinar_enrollment_notification(student_user, class_name, webinar_topic, payment_amount=None, payment_id=None):
        """
        Send notification when student is enrolled in a class with webinar
        
        Args:
            student_user: User object of the student
            class_name: String - name of the class
            webinar_topic: String - topic/name of the associated webinar
            payment_amount: Decimal - payment amount if available
            payment_id: String - payment ID if available
        """
        try:
            # Get student profile
            try:
                student_profile = StudentProfile.objects.get(user=student_user)
            except StudentProfile.DoesNotExist:
                logger.error(f"Student profile not found for user: {student_user.username}")
                return False
            
            # Create notification title and message
            title = f"🎓 Class Enrollment Confirmed"
            
            message_parts = [
                f"You have been successfully enrolled in: '{class_name}'",
            ]
            
            if payment_amount and payment_id:
                message_parts.extend([
                    f"Payment Amount: ${payment_amount}",
                    f"Payment ID: {payment_id}",
                    "Payment Status: Verified ✅"
                ])
            
            if webinar_topic:
                message_parts.extend([
                    f"Associated Webinar: '{webinar_topic}'",
                    "You will be automatically registered for the webinar."
                ])
            
            message_parts.extend([
                "You can now access all class materials and resources.",
                "Welcome to the class!"
            ])
            
            message = "\n\n".join(message_parts)
            
            # Create notification
            notification = Notification.objects.create(
                student_id=student_profile,
                title=title,
                message=message,
                type='webinar',
                read_status=False,
                created_at=timezone.now()
            )
            
            logger.info(f"✅ Enrollment notification sent to {student_user.username} for class {class_name}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to send enrollment notification to {student_user.username}: {e}")
            return False