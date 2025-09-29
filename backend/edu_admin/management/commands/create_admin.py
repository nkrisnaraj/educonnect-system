from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Create or update admin users with proper role'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, help='Username for admin user')
        parser.add_argument('--email', type=str, help='Email for admin user')
        parser.add_argument('--password', type=str, help='Password for admin user')

    def handle(self, *args, **options):
        username = options.get('username') or 'admin'
        email = options.get('email') or 'admin@example.com'
        password = options.get('password') or 'admin123'

        # Check if user exists
        try:
            user = User.objects.get(username=username)
            self.stdout.write(f'User {username} already exists')
            
            # Update role and permissions
            user.role = 'admin'
            user.is_staff = True
            user.is_superuser = True
            user.save()
            
            self.stdout.write(
                self.style.SUCCESS(f'✅ Updated {username} with admin role and permissions')
            )
            
        except User.DoesNotExist:
            # Create new admin user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                role='admin',
                is_staff=True,
                is_superuser=True
            )
            
            self.stdout.write(
                self.style.SUCCESS(f'✅ Created admin user: {username}')
            )

        # List all admin users
        admin_users = User.objects.filter(role='admin')
        self.stdout.write('\n📋 Current admin users:')
        for admin in admin_users:
            self.stdout.write(f'   - {admin.username} ({admin.email}) - Staff: {admin.is_staff}, Super: {admin.is_superuser}')