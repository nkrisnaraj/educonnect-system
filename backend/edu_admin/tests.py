from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from datetime import datetime, timedelta


class ZoomRecurringWebinarTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('create_zoom_webinar')  # Adjust if your URL name is different

    def test_create_recurring_webinar(self):
        start_time = (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%SZ")

        payload = {
            "account_key": "zoom1",  # Match key from ZOOM_ACCOUNTS in settings
            "topic": "Recurring Webinar Test",
            "type": 9,  # Recurring with fixed time
            "start_time": start_time,
            "duration": 30,
            "timezone": "Asia/Colombo",
            "agenda": "Testing recurring webinar creation via API",
            "repeat_type": "daily",        # matches your ZoomAPIClient expected param
            "repeat_interval": 1,
            "end_date_time": (datetime.utcnow() + timedelta(days=5)).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "settings": {
                "host_video": True,
                "panelists_video": True,
                "approval_type": 2,
                "audio": "both",
                "auto_recording": "cloud"
            }
        }

        response = self.client.post(self.url, payload, format='json')
        print("Response:", response.status_code, response.data)

        #  Ensure success
        self.assertEqual(response.status_code, 201)

        #  Check expected keys
        self.assertIn("data", response.data)
        self.assertEqual(response.data["data"]["type"], 9)
        self.assertIn("join_url", response.data["data"])
        self.assertIn("start_url", response.data["data"])
