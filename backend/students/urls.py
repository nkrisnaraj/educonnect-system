from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import OnlinePaymentView, ReceiptUploadView
from .views import PaymentInfoView,StudentProfileView
from .views import EditStudentProfileView
from . import views
from .views import get_chat_messages, send_chat_message


    



urlpatterns = [
    path('payments/online/', OnlinePaymentView.as_view(), name='online-payment'),
    # path('payhere-notify/', PayHereNotifyView.as_view(), name='payhere-notify'),
    path("payments/upload-receipt/",ReceiptUploadView.as_view(),name="upload-receipt"),
    path("payment-info/",PaymentInfoView.as_view(),name="payment-info"),
    path("student-profile/",StudentProfileView.as_view(),name="student-profile"),
    # path("payments/create-payhere-url/", CreatePayHereCheckoutUrl.as_view()),
    path('api/initiate-payment/', views.initiate_payment),
    path('api/payment/notify/', views.payment_notify),
    path('profile/',EditStudentProfileView.as_view(), name='student-edit-profile'),
    path('messages/<str:recipient_role>/',views.get_chat_messages, name='get_chat_messages'),
    path('messages/<str:recipient_role>/send/', views.send_chat_message, name='send_chat_message'),
    path('classes/', views.student_classess, name='get_classes'),
    
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

#serve files from MEDIA_ROOT via MEDIA_URL only during development.