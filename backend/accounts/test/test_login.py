from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import TestCase
from django.urls import reverse

User = get_user_model()

class LoginTestCase(TestCase):
    def setUp(self):
        # Create a test user in the test database
        self.username = "testuser"
        self.password = "testpass"
        self.user = User.objects.create_user(
            username=self.username, 
            password=self.password
        )

        #URL for the login API
        self.login_url = reverse('api/accounts/login')  

    def test_login_success(self):
        """Test login with correct username and password."""
        response = self.client.post(self.login_url, {
            "username" : self.username,
            "password" : self.password
        },
        format='json'
        )
    
    # Assertions
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["username"], self.username)

        print("\nLogin Success Summary:")
        print(f"Username: {self.username}")
        print(f"Access Token: {response.data['access'][:20]}...")  
        print(f"Refresh Token: {response.data['refresh'][:20]}...")

    def test_login_invalid_credentials(self):
        """Test login with wrong password."""
        response = self.client.post(
            self.login_url,
            {"username": self.username, "password": "wrongpass"},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("error", response.data)

        print("\nLogin Failure Summary:")
        print(response.data)

    def test_login_missing_fields(self):
        """Test login without sending username or password."""
        response = self.client.post(self.login_url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)  # or 400 if you change your API