from django.test import TestCase
from unittest.mock import patch
from edu_admin.zoom_api import ZoomAPIClient

class ZoomServiceTests(TestCase):
    @patch("edu_admin.zoom_api.ZoomAPIClient.get_access_token")
    @patch("edu_admin.zoom_api.requests.get")
    def test_list_webinars_success(self, mock_get, mock_token):
        mock_token.return_value = "fake_token"
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {
            "webinars": [
                {
                    "id": 123456,
                    "topic": "Mock Webinar",
                    "start_time": "2025-07-01T15:00:00Z"
                }
            ]
        }

        client = ZoomAPIClient("zoom1")
        data = client.list_webinars()
        if data :
            print("zoom service test passes")
        self.assertIn("webinars", data)
        self.assertEqual(data["webinars"][0]["topic"], "Mock Webinar")
