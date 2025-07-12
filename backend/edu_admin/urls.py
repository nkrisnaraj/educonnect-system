from django.urls import path
from .views import CreateZoomWebinarView, ListZoomWebinarsView, SyncZoomWebinarsView, WebinarListAPIView, ZoomAccountsListView
from .views import CreateClassWithWebinarView, ClassListView

urlpatterns = [
    path('create-webinar/', CreateZoomWebinarView.as_view(), name='create_zoom_webinar'),
    path('webinars/', ListZoomWebinarsView.as_view(), name='list-webinars'),
    path('sync-webinars/', SyncZoomWebinarsView.as_view(), name='sync-webinars'),
    path('webinars-list/', WebinarListAPIView.as_view(), name='webinar-list'),
    path('zoom-accounts/', ZoomAccountsListView.as_view(), name='zoom-accounts'),
    path("create_with_webinar/", CreateClassWithWebinarView.as_view(), name="create_class_with_webinar"),
    path("classes/", ClassListView.as_view(), name="class_list"),

]