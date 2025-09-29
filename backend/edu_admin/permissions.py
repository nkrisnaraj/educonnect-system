from rest_framework import permissions


class IsAdminRole(permissions.BasePermission):
    """
    Custom permission to only allow users with admin role.
    """
    
    def has_permission(self, request, view):
        print(f"🔑 Checking admin permission for user: {request.user}")
        print(f"🔑 User authenticated: {request.user.is_authenticated}")
        print(f"🔑 User is_superuser: {getattr(request.user, 'is_superuser', False)}")
        print(f"🔑 User is_staff: {getattr(request.user, 'is_staff', False)}")
        print(f"🔑 User role: {getattr(request.user, 'role', 'No role attribute')}")
        print(f"🔑 Authorization header: {request.headers.get('Authorization', 'No auth header')[:50]}...")
        
        # Check if user is authenticated first
        if not request.user or not request.user.is_authenticated:
            print("❌ User not authenticated")
            return False
        
        # Allow access for superusers, staff, or users with admin role
        has_permission = (
            request.user.is_superuser or
            request.user.is_staff or
            (hasattr(request.user, 'role') and request.user.role == 'admin')
        )
        
        print(f"🔑 Final permission result: {has_permission}")
        return has_permission


class IsInstructorRole(permissions.BasePermission):
    """
    Custom permission to only allow users with instructor role.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'role') and 
            request.user.role in ['admin', 'instructor']
        )


class IsStudentRole(permissions.BasePermission):
    """
    Custom permission to only allow users with student role.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'role') and 
            request.user.role in ['admin', 'instructor', 'student']
        )
