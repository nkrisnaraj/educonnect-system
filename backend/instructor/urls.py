from django.urls import path
from .views import (instructor_list_students_with_chats,instructor_get_chat_with_student,instructor_send_message_to_student,mark_messages_read)
from .views import get_all_students, instructor_profile, study_notes, study_note_detail, webinar_classes, instructor_classes, get_instructor_notifications, mark_notification_as_read
from .views import (exam_list_create, exam_detail, exam_questions, question_detail, 
                   duplicate_exam, publish_exam, exam_submissions, exam_analytics)

urlpatterns = [
    path('students/', get_all_students, name='get_all_students'),
    path('profile/', instructor_profile, name='instructor-profile'),
    path('notes/', study_notes, name='study-notes'),
    path('notes/<int:pk>/', study_note_detail, name='study-note-detail'),
    path('classes/', webinar_classes, name='webinar-classes'),    
    path('instructor/classes/', instructor_classes, name='instructor-classes'),
    path('notifications/', get_instructor_notifications, name="instructor_notifications"),
    path('chat/instructor/students/', instructor_list_students_with_chats, name='instructor-students-with-chats'),
    path('chat/instructor/<int:student_id>/', instructor_get_chat_with_student, name='instructor-get-chat-with-student'),
    path('chat/instructor/<int:student_id>/send/', instructor_send_message_to_student, name='instructor-send-message-to-student'),
    path('chat/instructor/<int:student_id>/mark_messages_read/', mark_messages_read,name="mark_messages_read"),
    
    # Enhanced Exam API URLs
    path('exams/', exam_list_create, name='exam-list-create'),
    path('exams/<int:exam_id>/', exam_detail, name='exam-detail'),
    path('exams/<int:exam_id>/questions/', exam_questions, name='exam-questions'),
    path('exams/<int:exam_id>/questions/<int:question_id>/', question_detail, name='question-detail'),
    path('exams/<int:exam_id>/duplicate/', duplicate_exam, name='duplicate-exam'),
    path('exams/<int:exam_id>/publish/', publish_exam, name='publish-exam'),
    path('exams/<int:exam_id>/submissions/', exam_submissions, name='exam-submissions'),
    path('exams/<int:exam_id>/analytics/', exam_analytics, name='exam-analytics'),
]