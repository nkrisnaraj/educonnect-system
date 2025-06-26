from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import OnlinePaymentView, ReceiptUploadView, PayHereNotifyView
from .views import PaymentInfoView,StudentProfileView
from .views import CreatePayHereCheckoutUrl


    



urlpatterns = [
    path('payments/online/', OnlinePaymentView.as_view(), name='online-payment'),
    path('payhere-notify/', PayHereNotifyView.as_view(), name='payhere-notify'),
    path("payments/upload-receipt/",ReceiptUploadView.as_view(),name="upload-receipt"),
    path("payment-info/",PaymentInfoView.as_view(),name="payment-info"),
    path("student-profile/",StudentProfileView.as_view(),name="student-profile"),
    path("payments/create-payhere-url/", CreatePayHereCheckoutUrl.as_view()),
    
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

#serve files from MEDIA_ROOT via MEDIA_URL only during development.