from django.urls import path
from .views import (
    get_all_students,
    instructor_list_students_with_chats,
    instructor_get_chat_with_student,
    instructor_send_message_to_student
)

urlpatterns = [
    path('students/', get_all_students, name='get_all_students'),
    path('chat/instructor/students/', instructor_list_students_with_chats, name='instructor-list-students-with-chats'),
    path('chat/instructor/<int:student_id>/', instructor_get_chat_with_student, name='instructor-get-chat-with-student'),
    path('chat/instructor/<int:student_id>/send/', instructor_send_message_to_student, name='instructor-send-message-to-student'),
]