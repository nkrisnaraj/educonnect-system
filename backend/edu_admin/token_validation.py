from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
import json

@method_decorator(csrf_exempt, name='dispatch')
class TokenValidationView(View):
    """
    Simple endpoint to check if a token is valid
    """
    def post(self, request):
        try:
            data = json.loads(request.body)
            token = data.get('token')
            
            if not token:
                return JsonResponse({
                    'valid': False,
                    'error': 'No token provided'
                })
            
            # Try to validate the token
            jwt_auth = JWTAuthentication()
            try:
                validated_token = jwt_auth.get_validated_token(token)
                user = jwt_auth.get_user(validated_token)
                
                return JsonResponse({
                    'valid': True,
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'role': getattr(user, 'role', 'unknown'),
                        'is_staff': user.is_staff,
                        'is_superuser': user.is_superuser
                    }
                })
                
            except (InvalidToken, TokenError) as e:
                return JsonResponse({
                    'valid': False,
                    'error': f'Token validation failed: {str(e)}'
                })
                
        except json.JSONDecodeError:
            return JsonResponse({
                'valid': False,
                'error': 'Invalid JSON'
            })
        except Exception as e:
            return JsonResponse({
                'valid': False,
                'error': f'Unexpected error: {str(e)}'
            })