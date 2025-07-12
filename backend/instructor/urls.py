from django.urls import path
from .views import get_all_students, instructor_profile, study_notes, study_note_detail, webinar_classes

urlpatterns = [
    path('students/', get_all_students, name='get_all_students'),
    path('profile/', instructor_profile, name='instructor-profile'),
    path('notes/', study_notes, name='study-notes'),
    path('notes/<int:pk>/', study_note_detail, name='study-note-detail'),
    path('classes/', webinar_classes, name='webinar-classes'),    
]