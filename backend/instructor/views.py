import hashlib
from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from accounts.models import User
from .models import InstructorProfile, StudyNote, Class, Exam, ExamQuestion, QuestionOption, ExamSubmission, ExamAnswer
from students.models import StudentProfile
from .serializers import (InstructorProfileSerializer, StudyNoteSerializer, ZoomWebinarSerializer, 
                         ClassSerializer, ExamSerializer, ExamListSerializer, ExamQuestionSerializer, 
                         ExamSubmissionSerializer, ExamAnswerSerializer)
from accounts.serializers import UserSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from edu_admin.models import ZoomWebinar
from django.db.models import Q, Avg, Max, Min
from students.models import ChatRoom, Message, Notification
from students.serializers import MessageSerializer
from .models import InstructorNotification
from .serializers import InstructorNotificationSerializer

# Create your views here.
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_all_students(request):
    if request.user.role != 'instructor':
        return Response({'detail': 'You do not have permission to perform this action.'}, status=403)
    
    students = User.objects.filter(role='student').select_related('student_profile')
    data = []

    for student in students:
        profile = getattr(student, 'student_profile', None)
        data.append({
            "id": student.id,
            "first_name": student.first_name,
            "last_name": student.last_name,
            "email": student.email,
            "student_profile": {
            "phone": profile.mobile if profile else "",
            "school":  profile.school_name if profile else "",
            "address": profile.address if profile else "",
            "year_of_al": profile.year_of_al if profile else "",
            }
        })

    return Response({"students": data})

@api_view(['GET', 'PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def instructor_profile(request):
    profile, _ = InstructorProfile.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        serializer = InstructorProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = InstructorProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully.", "data": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# List and Upload Notes
from students.models import Notification,Enrollment
@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def study_notes(request):
    if request.method == 'GET':
        search_query = request.query_params.get('search', '')
        related_class = request.query_params.get('related_class')

        notes = StudyNote.objects.select_related('related_class').filter(
            Q(title__icontains=search_query) |
            Q(description__icontains=search_query) |
            Q(related_class__title__icontains=search_query),
        ).order_by('-upload_date')

        if related_class and related_class.lower() != 'all':
            notes = notes.filter(related_class__id=related_class)

        serializer = StudyNoteSerializer(notes, many=True, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = StudyNoteSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            note = serializer.save(uploaded_by=request.user)
            # Notification logic starts here
            related_class = note.related_class
            enrollments = Enrollment.objects.filter(classid = related_class).select_related('stuid')
            for enrollment in enrollments:
                student_profile = enrollment.stuid
                Notification.objects.create(
                    student_id=student_profile,
                    title=note.title,
                    message=f"A new note '{note.title}' was uploaded for {related_class.title}.",
                    type="notes"
                )

            return Response({"message": "Note uploaded successfully.", "data": serializer.data}, status=status.HTTP_201_CREATED)
               
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Retrieve, Update, Delete Single Note
@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def study_note_detail(request, pk):
    try:
        note = StudyNote.objects.select_related('related_class').get(pk=pk)
    except StudyNote.DoesNotExist:
        return Response({'error': 'Study Note not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = StudyNoteSerializer(note, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = StudyNoteSerializer(note, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Note updated successfully.", "data": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        note.delete()
        return Response({"message": "Note deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


# List all class topics
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def webinar_classes(request):
    webinars = ZoomWebinar.objects.all().order_by('topic')
    serializer = ZoomWebinarSerializer(webinars, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def instructor_classes(request):
    classes = Class.objects.filter(instructor=request.user)
    serializer = ClassSerializer(classes, many=True)
    return Response({"classes": serializer.data})

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_instructor_notifications(request):
    notifications = InstructorNotification.objects.filter(
        instructor=request.user
    ).order_by("-created_at")
    
    serializer = InstructorNotificationSerializer(notifications, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def mark_notification_as_read(request, pk):
    try:
        notif = InstructorNotification.objects.get(id=pk, instructor=request.user)
        notif.read = True
        notif.save()
        return Response({"message": "Notification marked as read"})
    except InstructorNotification.DoesNotExist:
        return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def mark_all_notifications_as_read(request):
    """Mark all notifications as read for the current instructor"""
    if request.user.role != 'instructor':
        return Response({'error': 'Only instructors allowed'}, status=403)
    
    updated_count = InstructorNotification.objects.filter(
        instructor=request.user,
        read=False
    ).update(read=True)
    
    return Response({
        "message": f"{updated_count} notifications marked as read"
    })

@api_view(["DELETE"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_notification(request, pk):
    """Delete a specific notification"""
    if request.user.role != 'instructor':
        return Response({'error': 'Only instructors allowed'}, status=403)
    
    try:
        notif = InstructorNotification.objects.get(id=pk, instructor=request.user)
        notif.delete()
        return Response({"message": "Notification deleted successfully"})
    except InstructorNotification.DoesNotExist:
        return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(["DELETE"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_all_notifications(request):
    """Delete all notifications for the current instructor"""
    if request.user.role != 'instructor':
        return Response({'error': 'Only instructors allowed'}, status=403)
    
    deleted_count, _ = InstructorNotification.objects.filter(
        instructor=request.user
    ).delete()
    
    return Response({
        "message": f"{deleted_count} notifications deleted successfully"
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def instructor_list_students_with_chats(request):
    """
    List all students who have chat rooms with instructor or are enrolled in instructor's classes.
    """
    print(f"🔍 Request user: {request.user}")
    print(f"🔍 Request user authenticated: {request.user.is_authenticated}")
    print(f"🔍 Request user role: {getattr(request.user, 'role', 'No role')}")
    
    try:
        # Check if user is instructor
        if not hasattr(request.user, 'role') or request.user.role != 'instructor':
            print(f"❌ User role check failed: {getattr(request.user, 'role', 'No role')}")
            return Response({'error': 'Only instructors allowed'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get all students enrolled in this instructor's classes
        from students.models import Enrollment
        instructor_classes = Class.objects.filter(instructor=request.user)
        print(f"🔍 Instructor classes count: {instructor_classes.count()}")
        
        enrolled_students_ids = Enrollment.objects.filter(
            classid__in=instructor_classes
        ).values_list('stuid__user_id', flat=True).distinct()
        print(f"🔍 Enrolled student IDs: {list(enrolled_students_ids)}")
        
        students = User.objects.filter(
            id__in=enrolled_students_ids, 
            role='student'
        ).select_related('student_profile')
        print(f"🔍 Students found: {students.count()}")
        
        data = []
        for student in students:
            data.append({
                'id': student.id,
                'username': student.username,
                'first_name': student.first_name,
                'last_name': student.last_name,
                'email': student.email,
            })
        
        print(f"✅ Returning {len(data)} students")
        return Response({'students': data}, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"❌ Error in instructor_list_students_with_chats: {str(e)}")
        import traceback
        print(f"❌ Full traceback: {traceback.format_exc()}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def instructor_get_chat_with_student(request, student_id):
    """
    Get chat messages between instructor and a specific student.
    """
    if request.user.role != 'instructor':
        return Response({'error': 'Only instructors allowed'}, status=403)
    try:
        student = User.objects.get(id=student_id, role='student')
    except User.DoesNotExist:
        return Response({'error': 'Student not found'}, status=404)
    chat_room = ChatRoom.objects.filter(created_by=student, name='instructor').first()
    if not chat_room:
        return Response({'messages': []})
    messages = Message.objects.filter(chat_room=chat_room).order_by('created_at')
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def instructor_send_message_to_student(request, student_id):
    """
    Instructor sends a message to a specific student.
    """
    # 1. Check if the user is an instructor
    if request.user.role != 'instructor':
        return Response({'error': 'Only instructors allowed'}, status=403)

    # 2. Validate the student user
    try:
        student = User.objects.get(id=student_id, role='student')
    except User.DoesNotExist:
        return Response({'error': 'Student not found'}, status=404)
    print(f"Checking StudentProfile for user: {student.username} (ID: {student.id})")
    # 3. Safely access the student profile
    try:
        student_profile = StudentProfile.objects.get(user=student)
    except StudentProfile.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=404)

    # 4. Get message text
    message_text = request.data.get('message')
    if not message_text:
        return Response({'error': 'Message text is required'}, status=400)

    # 5. Create or get chat room (optional: filter more uniquely if needed)
    chat_room, created = ChatRoom.objects.get_or_create(created_by=student, name='instructor')

    # 6. Create the message
    message = Message.objects.create(chat_room=chat_room, sender=request.user, content=message_text)

    # 7. Create the notification for the specific student
    Notification.objects.create(
        student_id=student_profile,
        title="New message from instructor",
        message=message_text,
        type='message'
    )

    # 8. Return the message
    serializer = MessageSerializer(message)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_messages_read(request, student_id):
    if request.user.role != 'instructor':
        return Response({'error': 'Only instructors allowed'}, status=403)

    student = User.objects.filter(id=student_id, role='student').first()
    if not student:
        return Response({'error': 'Student not found'}, status=404)

    chat_room = ChatRoom.objects.filter(created_by=student, name='instructor').first()
    if not chat_room:
        return Response({'error': 'No chat room'}, status=404)

    # Mark messages from student to instructor as read
    Message.objects.filter(
        chat_room=chat_room,
        sender=student,
        is_seen=False
    ).update(is_seen=True)

    return Response({'status': 'ok'})


# Enhanced Exam API Views for Google Forms-style functionality
@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def exam_list_create(request):
    """List all exams for instructor or create a new exam"""
    if request.user.role != 'instructor':
        return Response({'error': 'Only instructors allowed'}, status=403)
    
    if request.method == 'GET':
        exams = Exam.objects.filter(instructor=request.user).order_by('-created_at')
        serializer = ExamListSerializer(exams, many=True)
        return Response({"exams": serializer.data})
    
    elif request.method == 'POST':
        data = request.data.copy()
        data['instructor'] = request.user.id
        serializer = ExamSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def exam_detail(request, exam_id):
    """Get, update, or delete a specific exam"""
    try:
        exam = Exam.objects.get(id=exam_id, instructor=request.user)
    except Exam.DoesNotExist:
        return Response({'error': 'Exam not found'}, status=404)
    
    if request.method == 'GET':
        serializer = ExamSerializer(exam)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = ExamSerializer(exam, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        exam.delete()
        return Response({'message': 'Exam deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def exam_questions(request, exam_id):
    """Get all questions for an exam or add a new question"""
    try:
        exam = Exam.objects.get(id=exam_id, instructor=request.user)
    except Exam.DoesNotExist:
        return Response({'error': 'Exam not found'}, status=404)
    
    if request.method == 'GET':
        questions = exam.questions.all().order_by('order')
        serializer = ExamQuestionSerializer(questions, many=True)
        return Response({"questions": serializer.data})
    
    elif request.method == 'POST':
        data = request.data.copy()
        data['exam'] = exam.id
        
        # Debug logging
        print(f"Creating question for exam {exam.id}")
        print(f"Question data: {data}")
        
        serializer = ExamQuestionSerializer(data=data)
        if serializer.is_valid():
            question = serializer.save()
            print(f"Question created successfully: {question.id}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def question_detail(request, exam_id, question_id):
    """Get, update, or delete a specific question"""
    try:
        exam = Exam.objects.get(id=exam_id, instructor=request.user)
        question = exam.questions.get(id=question_id)
    except (Exam.DoesNotExist, ExamQuestion.DoesNotExist):
        return Response({'error': 'Question not found'}, status=404)
    
    if request.method == 'GET':
        serializer = ExamQuestionSerializer(question)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = ExamQuestionSerializer(question, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        question.delete()
        return Response({'message': 'Question deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def duplicate_exam(request, exam_id):
    """Create a duplicate of an existing exam"""
    try:
        original_exam = Exam.objects.get(id=exam_id, instructor=request.user)
    except Exam.DoesNotExist:
        return Response({'error': 'Exam not found'}, status=404)
    
    # Create a duplicate exam
    duplicate_exam = Exam.objects.create(
        examname=f"{original_exam.examname} (Copy)",
        description=original_exam.description,
        classid=original_exam.classid,
        instructor=request.user,
        date=original_exam.date,
        start_time=original_exam.start_time,
        duration_minutes=original_exam.duration_minutes,
        total_marks=original_exam.total_marks,
        passing_marks=original_exam.passing_marks,
        allow_multiple_attempts=original_exam.allow_multiple_attempts,
        shuffle_questions=original_exam.shuffle_questions,
        show_results_immediately=original_exam.show_results_immediately,
        require_authentication=original_exam.require_authentication,
        collect_email=original_exam.collect_email,
        confirmation_message=original_exam.confirmation_message,
    )
    
    # Duplicate all questions and their options
    for question in original_exam.questions.all():
        new_question = ExamQuestion.objects.create(
            exam=duplicate_exam,
            question_text=question.question_text,
            question_type=question.question_type,
            order=question.order,
            is_required=question.is_required,
            marks=question.marks,
            description=question.description,
            scale_min=question.scale_min,
            scale_max=question.scale_max,
            scale_min_label=question.scale_min_label,
            scale_max_label=question.scale_max_label,
            allow_other_option=question.allow_other_option,
            shuffle_options=question.shuffle_options,
        )
        
        # Duplicate options
        for option in question.options.all():
            QuestionOption.objects.create(
                question=new_question,
                option_text=option.option_text,
                is_correct=option.is_correct,
                order=option.order,
            )
    
    serializer = ExamSerializer(duplicate_exam)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def publish_exam(request, exam_id):
    """Publish an exam to make it available to students"""
    try:
        exam = Exam.objects.get(id=exam_id, instructor=request.user)
    except Exam.DoesNotExist:
        return Response({'error': 'Exam not found'}, status=404)
    
    if exam.questions.count() == 0:
        return Response({'error': 'Cannot publish exam without questions'}, status=400)
    
    exam.is_published = True
    exam.status = 'published'
    exam.save()
    
    return Response({'message': 'Exam published successfully'})

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def exam_submissions(request, exam_id):
    """Get all submissions for a specific exam"""
    try:
        exam = Exam.objects.get(id=exam_id, instructor=request.user)
    except Exam.DoesNotExist:
        return Response({'error': 'Exam not found'}, status=404)
    
    submissions = ExamSubmission.objects.filter(exam=exam).order_by('-submitted_at')
    serializer = ExamSubmissionSerializer(submissions, many=True)
    return Response({"submissions": serializer.data})

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def exam_analytics(request, exam_id):
    """Get analytics data for an exam"""
    try:
        exam = Exam.objects.get(id=exam_id, instructor=request.user)
    except Exam.DoesNotExist:
        return Response({'error': 'Exam not found'}, status=404)
    
    submissions = ExamSubmission.objects.filter(exam=exam, is_completed=True)
    
    analytics = {
        'total_submissions': submissions.count(),
        'average_score': submissions.aggregate(Avg('percentage'))['percentage__avg'] or 0,
        'highest_score': submissions.aggregate(Max('percentage'))['percentage__max'] or 0,
        'lowest_score': submissions.aggregate(Min('percentage'))['percentage__min'] or 0,
        'pass_rate': submissions.filter(percentage__gte=exam.passing_marks).count() / submissions.count() * 100 if submissions.count() > 0 else 0,
    }
    
    return Response(analytics)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def exam_results(request):
    """Get comprehensive exam results with analytics and submissions for all instructor's exams"""
    try:
        # Get all exams for this instructor
        exams = Exam.objects.filter(instructor=request.user).order_by('-created_at')
        
        results = []
        for exam in exams:
            # Get submissions for this exam
            submissions = ExamSubmission.objects.filter(exam=exam).select_related('student__user').order_by('-submitted_at')
            
            completed_submissions = submissions.filter(is_completed=True)
            
            # Calculate analytics
            analytics = {
                'total_submissions': completed_submissions.count(),
                'total_attempted': submissions.count(),
                'average_score': completed_submissions.aggregate(Avg('percentage'))['percentage__avg'] or 0,
                'highest_score': completed_submissions.aggregate(Max('percentage'))['percentage__max'] or 0,
                'lowest_score': completed_submissions.aggregate(Min('percentage'))['percentage__min'] or 0,
                'pass_rate': completed_submissions.filter(percentage__gte=exam.passing_marks).count() / completed_submissions.count() * 100 if completed_submissions.count() > 0 else 0,
            }
            
            # Serialize submissions with student details
            submission_data = []
            for submission in submissions:
                student_user = submission.student.user  # Get User from StudentProfile
                student_name = f"{student_user.first_name} {student_user.last_name}".strip()
                if not student_name:
                    student_name = student_user.email
                    
                submission_data.append({
                    'id': submission.id,
                    'student_id': student_user.id,
                    'student_name': student_name,
                    'student_email': student_user.email,
                    'percentage': submission.percentage,
                    'score': submission.total_marks_obtained,  # Use total_marks_obtained
                    'total_marks': exam.total_marks,
                    'is_completed': submission.is_completed,
                    'submitted_at': submission.submitted_at,
                    'started_at': submission.started_at,  # Use started_at for time tracking
                })
            
            # Get class info
            exam_class = exam.classid  # This is the ForeignKey to Class
            batch_name = exam_class.title if exam_class else 'No Batch'
            subject = exam_class.title if exam_class else 'General'  # Using title as subject since there's no separate subject field
            
            exam_result = {
                'examId': exam.id,
                'examTitle': exam.examname,  # Using examname instead of title
                'subject': subject,
                'batch': batch_name,
                'date': exam.created_at.strftime('%Y-%m-%d'),
                'status': exam.status,
                'is_published': exam.is_published,
                'passing_marks': exam.passing_marks,
                'total_marks': exam.total_marks,
                'duration': exam.duration_minutes,  # Using duration_minutes
                'analytics': analytics,
                'submissions': submission_data
            }
            results.append(exam_result)
        
        return Response({'results': results})
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def exam_details_with_students(request, exam_id):
    """Get detailed exam information with all student participants and their scores"""
    try:
        exam = Exam.objects.get(id=exam_id, instructor=request.user)
        
        # Get all submissions for this exam
        submissions = ExamSubmission.objects.filter(exam=exam).select_related('student__user').order_by('-submitted_at')
        
        # Process student data
        student_data = []
        for submission in submissions:
            student_user = submission.student.user
            student_name = f"{student_user.first_name} {student_user.last_name}".strip()
            if not student_name:
                student_name = student_user.email
                
            student_data.append({
                'id': submission.id,
                'student_id': student_user.id,
                'student_name': student_name,
                'student_email': student_user.email,
                'percentage': submission.percentage,
                'score': submission.total_marks_obtained,
                'total_marks': exam.total_marks,
                'is_completed': submission.is_completed,
                'submitted_at': submission.submitted_at.strftime('%Y-%m-%d %H:%M:%S') if submission.submitted_at else None,
                'started_at': submission.started_at.strftime('%Y-%m-%d %H:%M:%S'),
                'status': 'Completed' if submission.is_completed else 'In Progress'
            })
        
        # Calculate analytics
        completed_submissions = submissions.filter(is_completed=True)
        analytics = {
            'total_participants': submissions.count(),
            'completed_count': completed_submissions.count(),
            'average_score': completed_submissions.aggregate(Avg('percentage'))['percentage__avg'] or 0,
            'highest_score': completed_submissions.aggregate(Max('percentage'))['percentage__max'] or 0,
            'lowest_score': completed_submissions.aggregate(Min('percentage'))['percentage__min'] or 0,
            'pass_rate': completed_submissions.filter(percentage__gte=exam.passing_marks).count() / completed_submissions.count() * 100 if completed_submissions.count() > 0 else 0,
        }
        
        # Get class info
        exam_class = exam.classid
        
        exam_details = {
            'examId': exam.id,
            'examTitle': exam.examname,
            'description': exam.description,
            'subject': exam_class.title if exam_class else 'General',
            'class_name': exam_class.title if exam_class else 'No Class',
            'date': exam.date.strftime('%Y-%m-%d'),
            'start_time': exam.start_time.strftime('%H:%M'),
            'duration': exam.duration_minutes,
            'total_marks': exam.total_marks,
            'passing_marks': exam.passing_marks,
            'status': exam.status,
            'is_published': exam.is_published,
            'created_at': exam.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'analytics': analytics,
            'students': student_data
        }
        
        return Response(exam_details)
        
    except Exam.DoesNotExist:
        return Response({'error': 'Exam not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def download_exam_results_csv(request, exam_id):
    """Download exam results as CSV file"""
    import csv
    from django.http import HttpResponse
    
    try:
        exam = Exam.objects.get(id=exam_id, instructor=request.user)
        
        # Create the HttpResponse object with CSV header
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{exam.examname}_results.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Student Name', 'Email', 'Score', 'Percentage', 'Total Marks', 'Status', 'Submitted At'])
        
        # Get submissions
        submissions = ExamSubmission.objects.filter(exam=exam).select_related('student__user').order_by('-submitted_at')
        
        for submission in submissions:
            student_user = submission.student.user
            student_name = f"{student_user.first_name} {student_user.last_name}".strip()
            if not student_name:
                student_name = student_user.email
            
            writer.writerow([
                student_name,
                student_user.email,
                submission.total_marks_obtained,
                f"{submission.percentage:.2f}%",
                exam.total_marks,
                'Completed' if submission.is_completed else 'In Progress',
                submission.submitted_at.strftime('%Y-%m-%d %H:%M:%S') if submission.submitted_at else 'Not submitted'
            ])
        
        return response
        
    except Exam.DoesNotExist:
        return Response({'error': 'Exam not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def download_all_exam_results_csv(request):
    """Download all exam results as CSV file"""
    import csv
    from django.http import HttpResponse
    
    try:
        # Create the HttpResponse object with CSV header
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="all_exam_results.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Exam Title', 'Subject', 'Date', 'Total Participants', 'Completed', 'Average Score', 'Highest Score', 'Lowest Score', 'Pass Rate'])
        
        # Get all exams for this instructor
        exams = Exam.objects.filter(instructor=request.user).order_by('-created_at')
        
        for exam in exams:
            submissions = ExamSubmission.objects.filter(exam=exam)
            completed_submissions = submissions.filter(is_completed=True)
            
            # Calculate analytics
            analytics = {
                'total_participants': submissions.count(),
                'completed_count': completed_submissions.count(),
                'average_score': completed_submissions.aggregate(Avg('percentage'))['percentage__avg'] or 0,
                'highest_score': completed_submissions.aggregate(Max('percentage'))['percentage__max'] or 0,
                'lowest_score': completed_submissions.aggregate(Min('percentage'))['percentage__min'] or 0,
                'pass_rate': completed_submissions.filter(percentage__gte=exam.passing_marks).count() / completed_submissions.count() * 100 if completed_submissions.count() > 0 else 0,
            }
            
            exam_class = exam.classid
            
            writer.writerow([
                exam.examname,
                exam_class.title if exam_class else 'General',
                exam.date.strftime('%Y-%m-%d'),
                analytics['total_participants'],
                analytics['completed_count'],
                f"{analytics['average_score']:.2f}%",
                f"{analytics['highest_score']:.2f}%",
                f"{analytics['lowest_score']:.2f}%",
                f"{analytics['pass_rate']:.2f}%"
            ])
        
        return response
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def download_exam_results_pdf(request, exam_id):
    """Download exam results as PDF file"""
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    from django.http import HttpResponse
    from io import BytesIO
    
    try:
        exam = Exam.objects.get(id=exam_id, instructor=request.user)
        
        # Create the HttpResponse object with PDF header
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{exam.examname}_results.pdf"'
        
        # Create PDF document
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        
        # Get styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=30,
            alignment=1  # Center alignment
        )
        
        # Add title
        title = Paragraph(f"Exam Results: {exam.examname}", title_style)
        elements.append(title)
        
        # Add exam details
        exam_class = exam.classid
        exam_info = [
            ['Subject:', exam_class.title if exam_class else 'General'],
            ['Date:', exam.date.strftime('%Y-%m-%d')],
            ['Duration:', f"{exam.duration_minutes} minutes"],
            ['Total Marks:', str(exam.total_marks)],
            ['Passing Marks:', str(exam.passing_marks)]
        ]
        
        exam_table = Table(exam_info, colWidths=[2*inch, 3*inch])
        exam_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.grey),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('BACKGROUND', (1, 0), (1, -1), colors.beige),
        ]))
        
        elements.append(exam_table)
        elements.append(Spacer(1, 20))
        
        # Get submissions
        submissions = ExamSubmission.objects.filter(exam=exam).select_related('student__user').order_by('-submitted_at')
        
        # Create student results table
        data = [['Student Name', 'Email', 'Score', 'Percentage', 'Status']]
        
        for submission in submissions:
            student_user = submission.student.user
            student_name = f"{student_user.first_name} {student_user.last_name}".strip()
            if not student_name:
                student_name = student_user.email
            
            data.append([
                student_name,
                student_user.email,
                f"{submission.total_marks_obtained}/{exam.total_marks}",
                f"{submission.percentage:.1f}%",
                'Completed' if submission.is_completed else 'In Progress'
            ])
        
        # Create table
        table = Table(data)
        table.setStyle(TableStyle([
            # Header row
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            
            # Data rows
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            # Alternating row colors
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.lightgrey, colors.white]),
        ]))
        
        elements.append(table)
        
        # Calculate summary statistics
        completed_submissions = submissions.filter(is_completed=True)
        if completed_submissions.exists():
            avg_score = completed_submissions.aggregate(Avg('percentage'))['percentage__avg']
            highest_score = completed_submissions.aggregate(Max('percentage'))['percentage__max']
            lowest_score = completed_submissions.aggregate(Min('percentage'))['percentage__min']
            pass_count = completed_submissions.filter(percentage__gte=exam.passing_marks).count()
            pass_rate = (pass_count / completed_submissions.count()) * 100
            
            elements.append(Spacer(1, 20))
            
            # Add summary
            summary_style = ParagraphStyle(
                'Summary',
                parent=styles['Heading2'],
                fontSize=12,
                spaceAfter=10
            )
            
            elements.append(Paragraph("Summary Statistics", summary_style))
            
            summary_data = [
                ['Total Participants:', str(submissions.count())],
                ['Completed:', str(completed_submissions.count())],
                ['Average Score:', f"{avg_score:.1f}%"],
                ['Highest Score:', f"{highest_score:.1f}%"],
                ['Lowest Score:', f"{lowest_score:.1f}%"],
                ['Pass Rate:', f"{pass_rate:.1f}%"]
            ]
            
            summary_table = Table(summary_data, colWidths=[2*inch, 1.5*inch])
            summary_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.lightblue),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ]))
            
            elements.append(summary_table)
        
        # Build PDF
        doc.build(elements)
        pdf = buffer.getvalue()
        buffer.close()
        response.write(pdf)
        
        return response
        
    except Exam.DoesNotExist:
        return Response({'error': 'Exam not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def download_all_exam_results_pdf(request):
    """Download all exam results as PDF file"""
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    from django.http import HttpResponse
    from io import BytesIO
    
    try:
        # Create the HttpResponse object with PDF header
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="all_exam_results.pdf"'
        
        # Create PDF document
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        
        # Get styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=30,
            alignment=1  # Center alignment
        )
        
        # Add title
        title = Paragraph("All Exam Results Summary", title_style)
        elements.append(title)
        elements.append(Spacer(1, 20))
        
        # Get all exams for this instructor
        exams = Exam.objects.filter(instructor=request.user).order_by('-created_at')
        
        # Create summary table
        data = [['Exam Title', 'Subject', 'Date', 'Participants', 'Completed', 'Avg Score', 'Pass Rate']]
        
        for exam in exams:
            submissions = ExamSubmission.objects.filter(exam=exam)
            completed_submissions = submissions.filter(is_completed=True)
            
            # Calculate analytics
            total_participants = submissions.count()
            completed_count = completed_submissions.count()
            avg_score = completed_submissions.aggregate(Avg('percentage'))['percentage__avg'] or 0
            pass_count = completed_submissions.filter(percentage__gte=exam.passing_marks).count()
            pass_rate = (pass_count / completed_count * 100) if completed_count > 0 else 0
            
            exam_class = exam.classid
            
            data.append([
                exam.examname,
                exam_class.title if exam_class else 'General',
                exam.date.strftime('%Y-%m-%d'),
                str(total_participants),
                str(completed_count),
                f"{avg_score:.1f}%",
                f"{pass_rate:.1f}%"
            ])
        
        # Create table
        table = Table(data)
        table.setStyle(TableStyle([
            # Header row
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            
            # Data rows
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            # Alternating row colors
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.lightgrey, colors.white]),
        ]))
        
        elements.append(table)
        
        # Build PDF
        doc.build(elements)
        pdf = buffer.getvalue()
        buffer.close()
        response.write(pdf)
        
        return response
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)
    """Download exam results as CSV file"""
    import csv
    from django.http import HttpResponse
    
    try:
        exam = Exam.objects.get(id=exam_id, instructor=request.user)
        
        # Create the HttpResponse object with CSV header
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{exam.examname}_results.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Student Name', 'Email', 'Score', 'Percentage', 'Total Marks', 'Status', 'Submitted At'])
        
        # Get submissions
        submissions = ExamSubmission.objects.filter(exam=exam).select_related('student__user').order_by('-submitted_at')
        
        for submission in submissions:
            student_user = submission.student.user
            student_name = f"{student_user.first_name} {student_user.last_name}".strip()
            if not student_name:
                student_name = student_user.email
            
            writer.writerow([
                student_name,
                student_user.email,
                submission.total_marks_obtained,
                f"{submission.percentage:.2f}%",
                exam.total_marks,
                'Completed' if submission.is_completed else 'In Progress',
                submission.submitted_at.strftime('%Y-%m-%d %H:%M:%S') if submission.submitted_at else 'Not submitted'
            ])
        
        return response
        
    except Exam.DoesNotExist:
        return Response({'error': 'Exam not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def download_all_exam_results_csv(request):
    """Download all exam results as CSV file"""
    import csv
    from django.http import HttpResponse
    
    try:
        # Create the HttpResponse object with CSV header
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="all_exam_results.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Exam Title', 'Subject', 'Date', 'Total Participants', 'Completed', 'Average Score', 'Highest Score', 'Lowest Score', 'Pass Rate'])
        
        # Get all exams for this instructor
        exams = Exam.objects.filter(instructor=request.user).order_by('-created_at')
        
        for exam in exams:
            submissions = ExamSubmission.objects.filter(exam=exam)
            completed_submissions = submissions.filter(is_completed=True)
            
            # Calculate analytics
            analytics = {
                'total_participants': submissions.count(),
                'completed_count': completed_submissions.count(),
                'average_score': completed_submissions.aggregate(Avg('percentage'))['percentage__avg'] or 0,
                'highest_score': completed_submissions.aggregate(Max('percentage'))['percentage__max'] or 0,
                'lowest_score': completed_submissions.aggregate(Min('percentage'))['percentage__min'] or 0,
                'pass_rate': completed_submissions.filter(percentage__gte=exam.passing_marks).count() / completed_submissions.count() * 100 if completed_submissions.count() > 0 else 0,
            }
            
            exam_class = exam.classid
            
            writer.writerow([
                exam.examname,
                exam_class.title if exam_class else 'General',
                exam.date.strftime('%Y-%m-%d'),
                analytics['total_participants'],
                analytics['completed_count'],
                f"{analytics['average_score']:.2f}%",
                f"{analytics['highest_score']:.2f}%",
                f"{analytics['lowest_score']:.2f}%",
                f"{analytics['pass_rate']:.2f}%"
            ])
        
        return response
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)
