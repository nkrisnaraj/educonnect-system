from django.test import TestCase
from accounts.views import has_zoom_account_for_email

class ZoomAccountRealApiTests(TestCase):
    def test_existing_zoom_account(self):
        """Test with an email that HAS a Zoom account"""
        # Use the email from your .env that you know has Zoom
        email = "sivathexam2023@gmail.com"
        result = has_zoom_account_for_email(email)
        print(f"Testing {email}: {result}")
        self.assertTrue(result, f"{email} should have a Zoom account")

    def test_non_existing_zoom_account(self):
        """Test with an email that does NOT have a Zoom account"""
        email = "nonexistentzoomuser12345@gmail.com"
        result = has_zoom_account_for_email(email)
        print(f"Testing {email}: {result}")
        self.assertFalse(result, f"{email} should NOT have a Zoom account")

    def test_function_directly_in_shell(self):
        """Test the function directly"""
        # Test with your known Zoom email
        result1 = has_zoom_account_for_email("sivathexam2023@gmail.com")
        print(f"Direct test sivathexam2023@gmail.com: {result1}")
        
        # Test with a non-existent email
        result2 = has_zoom_account_for_email("fakeemail999@gmail.com")
        print(f"Direct test fakeemail999@gmail.com: {result2}")
        
        self.assertTrue(result1)
        self.assertFalse(result2)
