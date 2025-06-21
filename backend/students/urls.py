from django.urls import path
from .views import OnlinePaymentView, ReceiptUploadView, PayHereNotifyView


urlpatterns = [
   path('payments/online/', OnlinePaymentView.as_view(), name='online-payment'),
    path('payments/receipt-upload/', ReceiptUploadView.as_view(), name='receipt-upload'),
    path('payhere-notify/', PayHereNotifyView.as_view(), name='payhere-notify'),
]
