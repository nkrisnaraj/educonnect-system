from django.urls import path
from .views import CreateZoomWebinarView, ListZoomWebinarsView

urlpatterns = [
    path('create-webinar/', CreateZoomWebinarView.as_view(), name='create_zoom_webinar'),
    path('webinars/', ListZoomWebinarsView.as_view(), name='list-webinars'),
]