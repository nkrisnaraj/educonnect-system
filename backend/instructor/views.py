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
        serializer = ExamQuestionSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
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
