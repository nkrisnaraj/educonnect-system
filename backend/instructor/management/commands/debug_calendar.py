from django.core.management.base import BaseCommand
from students.models import StudentProfile, Enrollment
from instructor.models import Class
from edu_admin.models import ZoomWebinar, ZoomOccurrence
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Debug calendar events - check what data exists'

    def add_arguments(self, parser):
        parser.add_argument('--student-id', type=int, help='Student user ID to check')

    def handle(self, *args, **options):
        student_id = options.get('student_id')
        
        if student_id:
            try:
                user = User.objects.get(id=student_id, role='student')
                student = StudentProfile.objects.get(user=user)
                self.stdout.write(f"Checking data for student: {user.first_name} {user.last_name}")
            except:
                self.stdout.write(self.style.ERROR(f"Student with ID {student_id} not found"))
                return
        else:
            # Get first student
            try:
                student = StudentProfile.objects.first()
                if not student:
                    self.stdout.write(self.style.ERROR("No students found"))
                    return
                self.stdout.write(f"Checking data for student: {student.user.first_name} {student.user.last_name}")
            except:
                self.stdout.write(self.style.ERROR("No students found"))
                return

        # Check enrollments - filter by successful payments
        enrollments = Enrollment.objects.filter(
            stuid=student, 
            payid__status='success'
        ).select_related('classid', 'payid')
        self.stdout.write(f"\n1. ENROLLMENTS: {enrollments.count()}")
        
        for enrollment in enrollments:
            class_obj = enrollment.classid
            self.stdout.write(f"   - Class: {class_obj.title} (ID: {class_obj.id})")
            self.stdout.write(f"     Start: {class_obj.start_date}, End: {class_obj.end_date}")
            self.stdout.write(f"     Has Webinar: {class_obj.webinar is not None}")
            if class_obj.webinar:
                self.stdout.write(f"     Webinar ID: {class_obj.webinar.webinar_id}")
                self.stdout.write(f"     Webinar Topic: {class_obj.webinar.topic}")

        # Check all webinars
        all_webinars = ZoomWebinar.objects.all()
        self.stdout.write(f"\n2. ALL WEBINARS: {all_webinars.count()}")
        for webinar in all_webinars:
            self.stdout.write(f"   - {webinar.topic} (ID: {webinar.id}, WebinarID: {webinar.webinar_id})")

        # Check all zoom occurrences
        all_occurrences = ZoomOccurrence.objects.all()
        self.stdout.write(f"\n3. ALL ZOOM OCCURRENCES: {all_occurrences.count()}")
        for occurrence in all_occurrences:
            self.stdout.write(f"   - Occurrence ID: {occurrence.occurrence_id}")
            self.stdout.write(f"     Webinar: {occurrence.webinar.topic}")
            self.stdout.write(f"     Start Time: {occurrence.start_time}")
            self.stdout.write(f"     Duration: {occurrence.duration}")

        # Check webinars for enrolled classes
        enrolled_class_ids = enrollments.values_list("classid__id", flat=True)
        classes_with_webinars = Class.objects.filter(
            id__in=enrolled_class_ids,
            webinar__isnull=False
        )
        
        self.stdout.write(f"\n4. ENROLLED CLASSES WITH WEBINARS: {classes_with_webinars.count()}")
        webinar_ids = []
        for class_obj in classes_with_webinars:
            self.stdout.write(f"   - Class: {class_obj.title}")
            self.stdout.write(f"     Webinar: {class_obj.webinar.topic}")
            webinar_ids.append(class_obj.webinar.id)

        # Check occurrences for enrolled webinars
        if webinar_ids:
            enrolled_occurrences = ZoomOccurrence.objects.filter(webinar__id__in=webinar_ids)
            self.stdout.write(f"\n5. OCCURRENCES FOR ENROLLED WEBINARS: {enrolled_occurrences.count()}")
            
            for occurrence in enrolled_occurrences:
                self.stdout.write(f"   - {occurrence.webinar.topic}")
                self.stdout.write(f"     Date: {occurrence.start_time.date() if occurrence.start_time else 'No date'}")
                self.stdout.write(f"     Time: {occurrence.start_time.time() if occurrence.start_time else 'No time'}")
                
                # Check if it falls within class date range
                for class_obj in classes_with_webinars:
                    if class_obj.webinar.id == occurrence.webinar.id:
                        if occurrence.start_time:
                            occurrence_date = occurrence.start_time.date()
                            in_range = class_obj.start_date <= occurrence_date <= class_obj.end_date
                            self.stdout.write(f"     Class Range: {class_obj.start_date} to {class_obj.end_date}")
                            self.stdout.write(f"     In Range: {in_range}")
                        break
        else:
            self.stdout.write(f"\n5. No webinar IDs found for enrolled classes")

        self.stdout.write(self.style.SUCCESS('\nDebugging complete!'))