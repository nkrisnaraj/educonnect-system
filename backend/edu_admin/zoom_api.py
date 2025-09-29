import base64
import requests
from django.conf import settings
import json
from datetime import date, timedelta

class ZoomAPIClient:
    def __init__(self, account_key: str):
        account = settings.ZOOM_ACCOUNTS.get(account_key)
        if not account:
            raise ValueError("Invalid Zoom account key provided")
        
        self.client_id = account["client_id"]
        self.client_secret = account["client_secret"]
        self.account_id = account["account_id"]
        self.user_id = account["user_id"]

    def get_access_token(self):
        auth = f"{self.client_id}:{self.client_secret}"
        b64_auth = base64.b64encode(auth.encode()).decode()

        headers = {
            "Authorization": f"Basic {b64_auth}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        data = {
            "grant_type": "account_credentials",
            "account_id": self.account_id
        }

        response = requests.post("https://zoom.us/oauth/token", headers=headers, data=data)
        response.raise_for_status()
        response_data = response.json()

        if "access_token" not in response_data:
            raise Exception("Zoom token response missing access_token")

        return response_data["access_token"]


    def create_webinar(
        self,
        topic,
        start_time,
        duration,
        agenda,
        repeat_type=None,
        repeat_interval=1,
        end_date_time=None,
        end_times=None,  # <-- Accept end_times for monthly repeat
        weekly_days=None,  # <-- Accept days of week for weekly repeat
    ):
        token = self.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        def calculate_occurrence_count(start_date, end_date, weekly_days):
            count = 0
            current = start_date
            weekday_set = set(weekly_days)

            while current <= end_date:
                if current.isoweekday() in weekday_set:
                    count += 1
                current += timedelta(days=1)
            
            return count


        payload = {
            "topic": topic,
            "start_time": start_time,
            "duration": duration,
            "timezone": "Asia/Colombo",
            "agenda": agenda,
            "settings": {
                "approval_type": 1,
                "registration_type": 1,
                "host_video": True,
                "panelists_video": True,
            }
        }

        repeat_type_map = {
            "daily": 1,
            "weekly": 2,
            "monthly": 3
        }

        if repeat_type and repeat_type in repeat_type_map:
            payload["type"] = 9  # Recurring webinar
            recurrence = {
                "type": repeat_type_map[repeat_type],
                "repeat_interval": repeat_interval,
            }

            if repeat_type == "weekly" and weekly_days:
                if isinstance(weekly_days, list):
                    # Join list of integers as comma-separated string
                    recurrence["weekly_days"] = ",".join(str(day) for day in weekly_days)

            if end_date_time:
                recurrence["end_date_time"] = end_date_time

            if end_times:
                # For monthly repeat, use end_times to specify occurrences
                recurrence["end_times"] = end_times

            payload["recurrence"] = recurrence
        else:
            payload["type"] = 5  # One-time webinar

        url = f"https://api.zoom.us/v2/users/{self.user_id}/webinars"
        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print("Zoom API Error:", e)
            print("Zoom Response:", response.text)
            raise

    def list_webinars(self)-> dict:
        token = self.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            # "Content-Type": "application/json"
        }
        url= f"https://api.zoom.us/v2/users/{self.user_id}/webinars"
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            if data :
                print("Zoom API Response: successfully fetched webinars")
            # print("Zoom Response (formatted):")
            # print(json.dumps(data, indent=4))  # Debugging line
            return response.json()
        except requests.exceptions.RequestException as e:
            print("Zoom API Error:", e)
            print("Zoom Response:", response.text)
            raise


    def get_webinar_detail(self, webinar_id: str) -> dict:
        token = self.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}"
        }
        url = f"https://api.zoom.us/v2/webinars/{webinar_id}?show_previous_occurrences=true"
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching webinar {webinar_id} detail:", e)
            raise

    def get_webinar_occurrences(self, webinar_id: str) -> dict:
        """Get all occurrences for a recurring webinar"""
        token = self.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}"
        }
        url = f"https://api.zoom.us/v2/webinars/{webinar_id}/registrants"
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching webinar {webinar_id} occurrences:", e)
            raise
