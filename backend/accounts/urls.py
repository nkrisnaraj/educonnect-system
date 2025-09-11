from django.urls import path
from .views import login_user, register_user, zoom_login, zoom_callback
from .views import StudentDetailView
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from .views import send_otp
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import SessionAuthentication, BasicAuthentication    
from .views import reset_password, verify_otp

urlpatterns = [
    path('login/', login_user, name='api-login'),
    path('register/', register_user, name='api-register'),
    path('zoom/login/', zoom_login, name='zoom-login'),
    path('zoom/callback/', zoom_callback, name='zoom-callback'),
    path('student/',StudentDetailView.as_view(),name='student-detail'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('send-otp/',send_otp, name='send-otp'),
    path('reset-password',reset_password, name='reset-password'),
    path('verify-otp/',verify_otp, name='verify-otp'),
    
]
