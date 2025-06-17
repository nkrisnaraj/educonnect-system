from rest_framework import status
from rest_framework.test import APITestCase
from dateutil import parser
from pytz import timezone

class ZoomWebinarTestCase(APITestCase):
    def setUp(self):
        self.list_url = "/edu_admin/webinars/?account_key=zoom1"
        self.local_tz = timezone("Asia/Colombo")

    def test_list_webinars_success(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        webinars = response.data.get("webinars", [])
        self.assertIsInstance(webinars, list)
        self.assertGreaterEqual(len(webinars), 1)

        print("\nWebinar Summary:")
        for webinar in webinars:
            topic = webinar.get("topic", "No Topic")
            webinar_id = webinar.get("id", "N/A")
            start_time = webinar.get("start_time")
            occurrences = webinar.get("occurrences", [])

            # Format the main start_time
            if start_time:
                dt_utc = parser.isoparse(start_time)
                dt_local = dt_utc.astimezone(self.local_tz)
                formatted_time = dt_local.strftime("%Y-%m-%d %I:%M %p")
            else:
                formatted_time = "N/A"

            print(f"Topic: {topic}")
            print(f"Webinar ID: {webinar_id}")
            print(f"Start Time: {formatted_time}")
            print(f"Occurrences:")
            for occ in occurrences:
                occ_start = occ.get("start_time")
                
                if occ_start:
                    occ_dt_utc = parser.isoparse(occ_start)
                    occ_dt_local = occ_dt_utc.astimezone(self.local_tz)
                    occ_time = occ_dt_local.strftime("%Y-%m-%d %I:%M %p")
                    print(f"   • {occ_time}")
            print("-" * 40)

