from django.test import TestCase
from edu_admin.serializers import ZoomWebinarSerializer

class WebinarCreateSerializerTests(TestCase):
    def test_valid_data(self):
        data = {
            "account_key": "zoom1",
            "topic": "Test Webinar",
            "start_time": "2025-07-01T15:00:00Z",
            "duration": 60,
            "agenda": "Testing",
            "repeat_type": "daily",       # allow_null=True இருந்தால் சரி, இல்லையெனில் நீக்கவும்
            "repeat_interval": 1,
            "end_date_time": "",
        }
        serializer = ZoomWebinarSerializer(data=data)
        is_valid = serializer.is_valid()   # முதலில் validate பண்ணும்
        print("Serializer Errors:", serializer.errors)
        self.assertTrue(is_valid)

    def test_missing_required_field(self):
        data = {"topic": ""}  # Required fields இல்லாம இருக்குது
        serializer = ZoomWebinarSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("account_key", serializer.errors)
