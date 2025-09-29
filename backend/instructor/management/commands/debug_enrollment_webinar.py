from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from students.models import StudentProfile, Enrollment
from instructor.models import Class
from edu_admin.models import ZoomWebinar

User = get_user_model()

class Command(BaseCommand):
    help = 'Debug enrollment and webinar relationship issues'

    def handle(self, *args, **options):
        # Get the first student with enrollments
        student_user = User.objects.filter(role='student').first()
        if not student_user:
            self.stdout.write(self.style.ERROR("No student users found"))
            return
            
        try:
            student_profile = StudentProfile.objects.get(user=student_user)
        except StudentProfile.DoesNotExist:
            self.stdout.write(self.style.ERROR("Student profile not found"))
            return

        self.stdout.write(f"=== DEBUGGING ENROLLMENT-WEBINAR RELATIONSHIPS ===")
        self.stdout.write(f"Student: {student_user.first_name} {student_user.last_name}")
        
        # Check enrollments
        enrollments = Enrollment.objects.filter(
            stuid=student_profile, 
            payid__status='success'
        ).select_related('classid', 'payid')
        
        self.stdout.write(f"\n1. ENROLLMENTS WITH SUCCESSFUL PAYMENTS: {enrollments.count()}")
        
        for enrollment in enrollments:
            self.stdout.write(f"\n   Enrollment {enrollment.enrollid}:")
            self.stdout.write(f"   - Class: {enrollment.classid.title} (ID: {enrollment.classid.classid})")
            self.stdout.write(f"   - Payment Status: {enrollment.payid.status}")
            
            # Check if this class has a webinar
            class_obj = enrollment.classid
            self.stdout.write(f"   - Class webinar field: {class_obj.webinar}")
            
            if hasattr(class_obj, 'webinar') and class_obj.webinar:
                self.stdout.write(f"   - Webinar Topic: {class_obj.webinar.topic}")
                self.stdout.write(f"   - Webinar ID: {class_obj.webinar.webinar_id}")
            else:
                self.stdout.write("   - No webinar assigned to this class")
                
        # Check all enrollments (regardless of payment status)
        all_enrollments = Enrollment.objects.filter(stuid=student_profile).select_related('classid', 'payid')
        self.stdout.write(f"\n2. ALL ENROLLMENTS (any payment status): {all_enrollments.count()}")
        
        for enrollment in all_enrollments:
            payment_status = enrollment.payid.status if enrollment.payid else 'No payment'
            self.stdout.write(f"   - Class: {enrollment.classid.title}, Payment: {payment_status}")

        # Show all classes with webinars
        classes_with_webinars = Class.objects.exclude(webinar__isnull=True).select_related('webinar')
        self.stdout.write(f"\n3. ALL CLASSES WITH WEBINARS: {classes_with_webinars.count()}")
        
        for class_obj in classes_with_webinars[:5]:  # Show first 5
            self.stdout.write(f"   - Class: {class_obj.title}")
            self.stdout.write(f"     Webinar: {class_obj.webinar.topic if class_obj.webinar else 'None'}")
        
        # Check if student is enrolled in any classes with webinars
        enrolled_class_ids = enrollments.values_list('classid__classid', flat=True)
        webinar_class_ids = classes_with_webinars.values_list('classid', flat=True)
        
        self.stdout.write(f"\n4. ENROLLED CLASS IDs: {list(enrolled_class_ids)}")
        self.stdout.write(f"5. CLASS IDs WITH WEBINARS: {list(webinar_class_ids[:10])}")  # Show first 10
        
        # Find intersection
        intersection = set(enrolled_class_ids) & set(webinar_class_ids)
        self.stdout.write(f"6. ENROLLED CLASSES THAT HAVE WEBINARS: {list(intersection)}")
        
        self.stdout.write("=== END DEBUG ===")