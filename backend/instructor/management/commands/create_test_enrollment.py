from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from students.models import StudentProfile, Enrollment, Payment
from instructor.models import Class

User = get_user_model()

class Command(BaseCommand):
    help = 'Create test enrollment for student to test calendar functionality'

    def handle(self, *args, **options):
        # Get the first student
        student_user = User.objects.filter(role='student').first()
        if not student_user:
            self.stdout.write(self.style.ERROR("No student found"))
            return
            
        student_profile = StudentProfile.objects.get(user=student_user)
        
        # Get a class that has webinars
        class_with_webinar = Class.objects.exclude(webinar__isnull=True).first()
        if not class_with_webinar:
            self.stdout.write(self.style.ERROR("No class with webinar found"))
            return
        
        # Check if already enrolled
        existing_enrollment = Enrollment.objects.filter(
            stuid=student_profile,
            classid=class_with_webinar
        ).first()
        
        if existing_enrollment:
            self.stdout.write(f"Student already enrolled in {class_with_webinar.title}")
            # Update payment to success if needed
            if existing_enrollment.payid and existing_enrollment.payid.status != 'success':
                existing_enrollment.payid.status = 'success'
                existing_enrollment.payid.save()
                self.stdout.write("Updated payment status to success")
            return
        
        # Create a successful payment
        payment = Payment.objects.create(
            stuid=student_user,
            method='online',
            amount=class_with_webinar.fee,
            status='success'
        )
        
        # Create enrollment
        enrollment = Enrollment.objects.create(
            stuid=student_profile,
            classid=class_with_webinar,
            payid=payment
        )
        
        self.stdout.write(self.style.SUCCESS(
            f"Successfully enrolled {student_user.first_name} {student_user.last_name} "
            f"in {class_with_webinar.title}"
        ))
        self.stdout.write(f"Class has webinar: {class_with_webinar.webinar.topic if class_with_webinar.webinar else 'None'}")
        
        if class_with_webinar.webinar:
            occurrences_count = class_with_webinar.webinar.occurrences.count()
            self.stdout.write(f"Webinar has {occurrences_count} occurrences")
        
        self.stdout.write("You can now test the calendar API - it should show Zoom occurrences!")