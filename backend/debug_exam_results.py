#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from instructor.models import Exam, ExamSubmission, Class
from django.db.models import Q, Avg, Max, Min

User = get_user_model()

def debug_exam_results():
    print("🔍 Debugging exam results function...")
    
    try:
        # Get instructor user
        instructor = User.objects.filter(role='instructor').first()
        if not instructor:
            print("❌ No instructor found")
            return
        
        print(f"👨‍🏫 Testing with instructor: {instructor.email}")
        
        # Get all exams for this instructor
        exams = Exam.objects.filter(instructor=instructor).order_by('-created_at')
        print(f"📚 Found {exams.count()} exams")
        
        results = []
        for i, exam in enumerate(exams):
            print(f"\n📖 Processing exam {i+1}: {exam.examname}")
            
            try:
                # Test each field access individually
                print(f"  - ID: {exam.id}")
                print(f"  - Name: {exam.examname}")
                print(f"  - Status: {exam.status}")
                print(f"  - Published: {exam.is_published}")
                print(f"  - Passing marks: {exam.passing_marks}")
                print(f"  - Total marks: {exam.total_marks}")
                print(f"  - Duration: {exam.duration_minutes}")
                print(f"  - Created: {exam.created_at}")
                
                # Test class access
                print(f"  - Class ID field: {exam.classid}")
                exam_class = exam.classid
                if exam_class:
                    print(f"  - Class title: {exam_class.title}")
                else:
                    print("  - No class associated")
                
                # Test submissions
                submissions = ExamSubmission.objects.filter(exam=exam).select_related('student__user')
                print(f"  - Total submissions: {submissions.count()}")
                
                completed_submissions = submissions.filter(is_completed=True)
                print(f"  - Completed submissions: {completed_submissions.count()}")
                
                # Test analytics calculations
                if completed_submissions.count() > 0:
                    avg_score = completed_submissions.aggregate(Avg('percentage'))['percentage__avg']
                    max_score = completed_submissions.aggregate(Max('percentage'))['percentage__max']
                    min_score = completed_submissions.aggregate(Min('percentage'))['percentage__min']
                    
                    print(f"  - Average score: {avg_score}")
                    print(f"  - Max score: {max_score}")
                    print(f"  - Min score: {min_score}")
                    
                    pass_count = completed_submissions.filter(percentage__gte=exam.passing_marks).count()
                    pass_rate = pass_count / completed_submissions.count() * 100
                    print(f"  - Pass rate: {pass_rate}%")
                else:
                    print("  - No completed submissions for analytics")
                
                # Test submission data processing
                for j, submission in enumerate(submissions[:3]):  # Test first 3 submissions
                    print(f"    Submission {j+1}:")
                    print(f"      - Student: {submission.student}")
                    student_user = submission.student.user  # Access user through StudentProfile
                    print(f"      - First name: {student_user.first_name}")
                    print(f"      - Last name: {student_user.last_name}")
                    print(f"      - Email: {student_user.email}")
                    print(f"      - Percentage: {submission.percentage}")
                    print(f"      - Completed: {submission.is_completed}")
                
                print("✅ Exam processed successfully")
                
            except Exception as e:
                print(f"❌ Error processing exam {exam.examname}: {e}")
                import traceback
                traceback.print_exc()
                
    except Exception as e:
        print(f"❌ Overall error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    debug_exam_results()