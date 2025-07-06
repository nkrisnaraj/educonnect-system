from django.urls import path
from .views import get_all_students, instructor_profile

urlpatterns = [
    path('students/', get_all_students, name='get_all_students'),
    path('profile/', instructor_profile, name='instructor-profile'),
]