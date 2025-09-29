from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from students.models import StudentProfile, Enrollment, Payment
from instructor.models import Class

User = get_user_model()

class Command(BaseCommand):
    help = 'Check all students and their enrollments'

    def handle(self, *args, **options):
        self.stdout.write("=== CHECKING ALL STUDENTS AND ENROLLMENTS ===")
        
        # Get all students
        students = User.objects.filter(role='student')
        self.stdout.write(f"Total students: {students.count()}")
        
        for student_user in students:
            try:
                student_profile = StudentProfile.objects.get(user=student_user)
                enrollments = Enrollment.objects.filter(stuid=student_profile)
                successful_enrollments = Enrollment.objects.filter(
                    stuid=student_profile, 
                    payid__status='success'
                )
                
                self.stdout.write(f"\n--- Student: {student_user.first_name} {student_user.last_name} ---")
                self.stdout.write(f"Total enrollments: {enrollments.count()}")
                self.stdout.write(f"Successful enrollments: {successful_enrollments.count()}")
                
                if enrollments.exists():
                    for enrollment in enrollments:
                        payment_status = enrollment.payid.status if enrollment.payid else 'No payment'
                        self.stdout.write(f"  - Class: {enrollment.classid.title}, Payment: {payment_status}")
                
            except StudentProfile.DoesNotExist:
                self.stdout.write(f"Student {student_user.username} has no profile")
        
        # Check all enrollments regardless of student
        self.stdout.write(f"\n=== ALL ENROLLMENTS IN SYSTEM ===")
        all_enrollments = Enrollment.objects.all().select_related('stuid', 'classid', 'payid')
        self.stdout.write(f"Total enrollments: {all_enrollments.count()}")
        
        successful_payments = Enrollment.objects.filter(payid__status='success')
        self.stdout.write(f"Enrollments with successful payments: {successful_payments.count()}")
        
        # Show some examples
        for enrollment in all_enrollments[:5]:
            payment_status = enrollment.payid.status if enrollment.payid else 'No payment'
            student_name = f"{enrollment.stuid.user.first_name} {enrollment.stuid.user.last_name}" if enrollment.stuid else 'Unknown'
            self.stdout.write(f"  - {student_name} in {enrollment.classid.title}, Payment: {payment_status}")