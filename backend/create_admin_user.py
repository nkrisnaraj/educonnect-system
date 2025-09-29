from accounts.models import User

# Create or update admin user
try:
    admin_user = User.objects.get(username='admin')
    print(f"Admin user already exists: {admin_user.username}")
    admin_user.role = 'admin'
    admin_user.is_staff = True
    admin_user.is_superuser = True
    admin_user.save()
    print("Updated admin user role and permissions")
except User.DoesNotExist:
    admin_user = User.objects.create_user(
        username='admin',
        email='admin@educonnect.com',
        password='admin123',
        role='admin',
        is_staff=True,
        is_superuser=True
    )
    print(f"Created new admin user: {admin_user.username}")

print(f"Admin user details:")
print(f"Username: {admin_user.username}")
print(f"Email: {admin_user.email}")
print(f"Role: {admin_user.role}")
print(f"Is Staff: {admin_user.is_staff}")
print(f"Is Superuser: {admin_user.is_superuser}")
