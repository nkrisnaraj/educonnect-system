from django.urls import path
from .views import OnlinePaymentView, ReceiptUploadView, PayHereNotifyView



urlpatterns = [
    path('payments/online/', OnlinePaymentView.as_view(), name='online-payment'),
    path('payhere-notify/', PayHereNotifyView.as_view(), name='payhere-notify'),
    path("payments/upload-receipt",ReceiptUploadView.as_view(),name="upload-receipt"),
    
]
