from django.urls import path
from .views import CreateZoomWebinarView, ListZoomWebinarsView, SyncZoomWebinarsView, WebinarListAPIView

urlpatterns = [
    path('create-webinar/', CreateZoomWebinarView.as_view(), name='create_zoom_webinar'),
    path('webinars/', ListZoomWebinarsView.as_view(), name='list-webinars'),
    path('sync-webinars/', SyncZoomWebinarsView.as_view(), name='sync-webinars'),
    path('webinars-list/', WebinarListAPIView.as_view(), name='webinar-list'),

]