from django.urls import path
from .views import CreateZoomWebinarView

urlpatterns = [
    path('create-webinar/', CreateZoomWebinarView.as_view(), name='create_zoom_webinar'),
]