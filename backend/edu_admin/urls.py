from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CreateZoomWebinarView, ListZoomWebinarsView, SyncZoomWebinarsView, WebinarListAPIView, ZoomAccountsListView,
    CreateClassWithWebinarView, ClassListView, StudentListView, PaymentListView,
    ReceiptPaymentAdminViewSet, ComprehensiveWebinarSyncView, WebinarSyncStatusView, CreateClassFromWebinarView,
    UpdateClassView, DashboardStatsView, admin_test
)


router = DefaultRouter()
router.register(r'receipt-payments', ReceiptPaymentAdminViewSet, basename='receipt-payment')

urlpatterns = [
    path('create-webinar/', CreateZoomWebinarView.as_view(), name='create_zoom_webinar'),
    path('webinars/', ListZoomWebinarsView.as_view(), name='list-webinars'),
    path('sync-webinars/', SyncZoomWebinarsView.as_view(), name='sync-webinars'),
    path('comprehensive-sync/', ComprehensiveWebinarSyncView.as_view(), name='comprehensive-sync'),
    path('sync-status/', WebinarSyncStatusView.as_view(), name='sync-status'),
    path('create-class-from-webinar/', CreateClassFromWebinarView.as_view(), name='create-class-from-webinar'),
    path('webinars-list/', WebinarListAPIView.as_view(), name='webinar-list'),
    path('zoom-accounts/', ZoomAccountsListView.as_view(), name='zoom-accounts'),
    path("create_with_webinar/", CreateClassWithWebinarView.as_view(), name="create_class_with_webinar"),
    path("classes/", ClassListView.as_view(), name="class_list"),
    path("classes/<int:class_id>/update/", UpdateClassView.as_view(), name="update_class"),
    path('students/', StudentListView.as_view(), name='student-list'),
    path("payments/", PaymentListView.as_view(), name="payment-list"),
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('admin-test/', admin_test, name='admin-test'),

    path("", include(router.urls)),  # <-- include router URLs here
]