import json
from unittest.mock import patch
from rest_framework.test import APITestCase
from rest_framework import status
from pytz import timezone

class ZoomWebinarTestCase(APITestCase):
    def setUp(self):
        self.create_url = "/edu_admin/create-webinar/"  # Endpoint for creating webinars
        self.list_url = "/edu_admin/webinars/?account_key=zoom1"
        self.local_tz = timezone("Asia/Colombo")

    @patch("edu_admin.views.ZoomAPIClient.create_webinar")
    def test_create_webinar_success(self, mock_create_webinar):
        mock_create_webinar.return_value = {
            "id": 999888,
            "topic": "Mock Webinar",
            "start_time": "2025-07-01T15:00:00Z",
            "duration": 60
        }

        payload = {
            "account_key": "zoom1",
            "topic": "Mock Webinar",
            "start_time": "2025-07-07T15:00:00Z",
            "duration": 60,
            "agenda": "Testing",
            "repeat_type": "daily",
            "repeat_interval": 1,
            "end_date_time": "2025-07-10T15:00:00Z"
        }

        response = self.client.post(self.create_url, data=payload, format="json")
        print("SUCCESS STATUS:", response.status_code)
        print("JSON RESPONSE:")
        print(json.dumps(response.data, indent=2))
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["message"], "Webinar created successfully")
        self.assertEqual(response.data["data"]["topic"], "Mock Webinar")


    def test_create_webinar_invalid_payload(self):
        payload = {
            "topic": "",
            "start_time": "",
            "duration": 0
        }

        response = self.client.post(self.create_url, data=payload, format="json")
        print("INVALID PAYLOAD STATUS:", response.status_code)
        print("ERRORS:")
        print(json.dumps(response.data, indent=2))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("account_key", response.data)
        self.assertIn("topic", response.data)

    @patch("edu_admin.views.ZoomAPIClient.create_webinar")
    def test_create_webinar_api_failure(self, mock_create_webinar):
        mock_create_webinar.side_effect = Exception("Zoom API Error")

        payload = {
            "account_key": "zoom1",
            "topic": "Fail Webinar",
            "start_time": "2025-07-01T15:00:00Z",
            "duration": 60,
        }

        response = self.client.post(self.create_url, data=payload, format="json")
        print("API FAILURE STATUS:", response.status_code)
        print("ERROR MESSAGE:")
        print(json.dumps(response.data, indent=2))
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn("error", response.data)

@patch("edu_admin.views.ZoomAPIClient.create_webinar")
def test_create_weekly_webinar_with_days(self, mock_create_webinar):
    mock_create_webinar.return_value = {
        "id": 123456,
        "topic": "Weekly Webinar",
        "start_time": "2025-07-07T15:00:00Z",
        "duration": 90
    }

    payload = {
        "account_key": "zoom1",
        "topic": "Weekly Webinar",
        "start_time": "2025-07-07T15:00:00Z",
        "duration": 90,
        "agenda": "Weekly recurring webinar",
        "repeat_type": "weekly",
        "repeat_interval": 1,
        "end_date_time": "2025-09-30T15:00:00Z",
        "weekly_days": [2, 4, 6]  # Monday, Wednesday, Friday
    }

    response = self.client.post(self.create_url, data=payload, format="json")
    print("WEEKLY REPEAT STATUS:", response.status_code)
    print("RESPONSE:")
    print(json.dumps(response.data, indent=2))

    self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    self.assertEqual(response.data["data"]["topic"], "Weekly Webinar")
