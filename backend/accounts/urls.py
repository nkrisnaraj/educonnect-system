from django.urls import path
from .views import login_user, register_user
from .views import StudentDetailView
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView

urlpatterns = [
    path('login/', login_user, name='api-login'),
    path('register/', register_user, name='api-register'),
    path('student/',StudentDetailView.as_view(),name='student-detail'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    
]
