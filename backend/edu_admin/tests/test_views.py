from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

class WebinarViewTests(APITestCase):
    def test_list_webinars(self):
        url = "/edu_admin/webinars/?account_key=zoom1"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("webinars", response.data)
