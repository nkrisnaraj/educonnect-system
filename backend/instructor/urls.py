from django.urls import path
from .views import get_all_students

urlpatterns = [
    path('students/', get_all_students, name='get_all_students'),
]