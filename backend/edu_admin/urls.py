from django.urls import path
<<<<<<< HEAD
from .views import CreateZoomWebinarView, ListZoomWebinarsView, SyncZoomWebinarsView, WebinarListAPIView
from .views import admin_get_chat_with_student, admin_list_students_with_chats,admin_send_message_to_student
=======
from .views import CreateZoomWebinarView, ListZoomWebinarsView, SyncZoomWebinarsView, WebinarListAPIView, ZoomAccountsListView
from .views import CreateClassWithWebinarView, ClassListView
>>>>>>> 2dc3fdd6c0ad5724c0d25ad4ff0219f83d16d713

urlpatterns = [
    path('create-webinar/', CreateZoomWebinarView.as_view(), name='create_zoom_webinar'),
    path('webinars/', ListZoomWebinarsView.as_view(), name='list-webinars'),
    path('sync-webinars/', SyncZoomWebinarsView.as_view(), name='sync-webinars'),
    path('webinars-list/', WebinarListAPIView.as_view(), name='webinar-list'),
<<<<<<< HEAD
    path('chat/admin/students/', admin_list_students_with_chats, name='admin-list-students-with-chats'),
    path('chat/admin/<int:student_id>/', admin_get_chat_with_student, name='admin-get-chat-with-student'),
    path('chat/admin/<int:student_id>/send/', admin_send_message_to_student, name='admin-send-message-to-student'),
=======
    path('zoom-accounts/', ZoomAccountsListView.as_view(), name='zoom-accounts'),
    path("create_with_webinar/", CreateClassWithWebinarView.as_view(), name="create_class_with_webinar"),
    path("classes/", ClassListView.as_view(), name="class_list"),
>>>>>>> 2dc3fdd6c0ad5724c0d25ad4ff0219f83d16d713

]