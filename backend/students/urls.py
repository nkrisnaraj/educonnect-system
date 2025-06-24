from django.urls import path
<<<<<<< HEAD
from .views import OnlinePaymentView, PayHereNotifyView
# from .views import OnlinePaymentView, ReceiptUploadView, PayHereNotifyView

=======
from django.conf import settings
from django.conf.urls.static import static
from .views import OnlinePaymentView, ReceiptUploadView, PayHereNotifyView
from .views import PaymentInfoView,StudentProfileView
>>>>>>> 1844dbe8856c840a3e69d352db68a4ba31a8d5c8


urlpatterns = [
    path('payments/online/', OnlinePaymentView.as_view(), name='online-payment'),
    path('payhere-notify/', PayHereNotifyView.as_view(), name='payhere-notify'),
<<<<<<< HEAD
    # path("payments/upload-receipt",ReceiptUploadView.as_view(),name="upload-receipt"),
=======
    path("payments/upload-receipt/",ReceiptUploadView.as_view(),name="upload-receipt"),
    path("payment-info/",PaymentInfoView.as_view(),name="payment-info"),
    path("student-profile/",StudentProfileView.as_view(),name="student-profile")

>>>>>>> 1844dbe8856c840a3e69d352db68a4ba31a8d5c8
    
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

#serve files from MEDIA_ROOT via MEDIA_URL only during development.