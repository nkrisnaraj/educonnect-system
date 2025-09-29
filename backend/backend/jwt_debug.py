"""
Custom middleware to debug JWT authentication
"""
import logging

logger = logging.getLogger(__name__)

class JWTDebugMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Debug authentication headers
        auth_header = request.headers.get('Authorization', 'No auth header')
        print(f"🔑 JWT Debug - Authorization header: {auth_header[:50]}...")
        
        if 'Bearer' in auth_header:
            token = auth_header.split(' ')[1] if len(auth_header.split(' ')) > 1 else 'No token'
            print(f"🔑 JWT Debug - Token: {token[:20]}...")
        
        print(f"🔑 JWT Debug - User before: {request.user}")
        
        response = self.get_response(request)
        
        print(f"🔑 JWT Debug - User after: {request.user}")
        
        return response