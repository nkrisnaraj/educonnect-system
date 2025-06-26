from django.urls import path
<<<<<<< HEAD
from .views import OnlinePaymentView, PayHereNotifyView
from .views import OnlinePaymentView, PayHereNotifyView
# from .views import OnlinePaymentView, ReceiptUploadView, PayHereNotifyView
=======
from django.conf import settings
from django.conf.urls.static import static
from .views import OnlinePaymentView, ReceiptUploadView, PayHereNotifyView
from .views import PaymentInfoView,StudentProfileView
from .views import CreatePayHereCheckoutUrl


    
>>>>>>> a8a3ecf80f4383e3046071a59c3ac0906236bf53



urlpatterns = [
    path('payments/online/', OnlinePaymentView.as_view(), name='online-payment'),
    path('payhere-notify/', PayHereNotifyView.as_view(), name='payhere-notify'),
<<<<<<< HEAD
    # path("payments/upload-receipt",ReceiptUploadView.as_view(),name="upload-receipt"),
    # path("payments/upload-receipt",ReceiptUploadView.as_view(),name="upload-receipt"),
=======
    path("payments/upload-receipt/",ReceiptUploadView.as_view(),name="upload-receipt"),
    path("payment-info/",PaymentInfoView.as_view(),name="payment-info"),
    path("student-profile/",StudentProfileView.as_view(),name="student-profile"),
    path("payments/create-payhere-url/", CreatePayHereCheckoutUrl.as_view()),
>>>>>>> a8a3ecf80f4383e3046071a59c3ac0906236bf53
    
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

#serve files from MEDIA_ROOT via MEDIA_URL only during development.