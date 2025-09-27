from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import OnlinePaymentView, ReceiptUploadView
from .views import PaymentInfoView,StudentProfileView
from .views import EditStudentProfileView
from . import views
from .chat_views import RoomMessagesView

    



urlpatterns = [
    path('payments/online/', OnlinePaymentView.as_view(), name='online-payment'),
    # path('payhere-notify/', PayHereNotifyView.as_view(), name='payhere-notify'),
    path("payments/upload-receipt/", ReceiptUploadView.as_view(), name="upload-receipt"),
    path("payment-info/", PaymentInfoView.as_view(), name="payment-info"),
    path("student-profile/", StudentProfileView.as_view(), name="student-profile"),
    # path("payments/create-payhere-url/", CreatePayHereCheckoutUrl.as_view()),
    path('api/initiate-payment/', views.initiate_payment),
    path('api/payment/notify/', views.payment_notify),
    path('profile/', EditStudentProfileView.as_view(), name='student-edit-profile'),
    path('messages/<str:recipient_role>/', views.get_chat_messages, name='get_chat_messages'),
    path('messages/<str:recipient_role>/send/', views.send_chat_message, name='send_chat_message'),
    path('mark_messages_read_student/', views.mark_messages_read_student, name="mark_message_read_student"),
    path('classes/', views.student_classess, name='get_classes'),
    path('marks/', views.getStudentMarks, name='get_student_marks'),
    path('enroll-class/', views.enroll_class, name='enroll_class'),
    path('calendar-events/', views.calendarEvent, name="calendar-events"),
    path('notifications/',views.get_notifications,name='notifications'),
    path('notifications/<int:pk>/read/',views.mark_notification_read, name='mark-notification-read'),
    path('notifications/<int:pk>/delete/',views.delete_notification, name='delete-notification'),
    path('class/<str:classid>/notes/', views.get_notes, name='get_notes'),
    path('class/<str:classid>/link-notes/', views.link_notes_to_webinar, name='link_notes_to_webinar'),
    path('getallclass/', views.getAllClass, name='get_all_classes'),
    path('chat/rooms/<int:room_id>/messages/', RoomMessagesView.as_view(), name='room-messages'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

#serve files from MEDIA_ROOT via MEDIA_URL only during development.