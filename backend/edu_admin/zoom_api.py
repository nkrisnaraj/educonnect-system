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

    def register_for_webinar(self, webinar_id: str, email: str, first_name: str, last_name: str, custom_questions: list = None, username: str = None, payment_id: str = None) -> dict:
        """Register a user for a webinar with support for custom questions"""
        token = self.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "email": email,
            "first_name": first_name,
            "last_name": last_name
        }
        
        # Add custom questions if provided
        if custom_questions:
            payload["custom_questions"] = custom_questions
        
        url = f"https://api.zoom.us/v2/webinars/{webinar_id}/registrants"
        try:
            response = requests.post(url, headers=headers, json=payload)
            
            # If we get a 400 error about custom questions, try to get webinar details and auto-fill required fields
            if response.status_code == 400 and "custom_questions" in response.text:
                print(f"⚠️ Custom questions required for webinar {webinar_id}, attempting to auto-fill...")
                
                try:
                    # Get webinar details to see what questions are required
                    webinar_detail = self.get_webinar_detail(webinar_id)
                    print(f"📋 Webinar settings: {webinar_detail.get('settings', {})}")
                    
                    # Create meaningful default answers using student info
                    serial_number = username or email.split('@')[0]
                    secret_number = payment_id or f"PAY-{webinar_id[-8:]}"
                    
                    # Create default answers for ALL common required questions
                    default_custom_questions = [
                        {"title": "Serial number", "value": serial_number},
                        {"title": "Secret number ", "value": secret_number},  # Note the space
                        {"title": "Secret number", "value": secret_number},   # Without space
                        {"title": "Student ID", "value": serial_number},
                        {"title": "Student Number", "value": serial_number},
                        {"title": "Username", "value": serial_number},
                        {"title": "Payment ID", "value": secret_number},
                        {"title": "Registration ID", "value": secret_number},
                        {"title": "Company", "value": "Educational Institution"},
                        {"title": "Organization", "value": "Educational Institution"},
                        {"title": "Job Title", "value": "Student"},
                        {"title": "Industry", "value": "Education"},
                        {"title": "Phone", "value": "+1234567890"},
                        {"title": "Mobile", "value": "+1234567890"},
                        {"title": "Address", "value": "Student Address"},
                        {"title": "City", "value": "Student City"},
                        {"title": "State", "value": "Student State"},
                        {"title": "Country", "value": "US"},
                        {"title": "Zip", "value": "12345"},
                        {"title": "Postal Code", "value": "12345"},
                        {"title": "Department", "value": "Student Affairs"},
                        {"title": "Employee ID", "value": serial_number},
                        {"title": "Registration Code", "value": secret_number},
                        {"title": "Access Code", "value": f"ACC-{serial_number}"},
                        {"title": "Verification Code", "value": f"VER-{secret_number[-8:]}"}
                    ]
                    
                    if default_custom_questions:
                        payload["custom_questions"] = default_custom_questions
                        print(f"🔄 Retrying with meaningful custom questions:")
                        print(f"   📝 Serial number (username): {serial_number}")
                        print(f"   🔑 Secret number (payment ID): {secret_number}")
                        print(f"   📋 Total fields: {len(default_custom_questions)}")
                        
                        # Retry the registration
                        response = requests.post(url, headers=headers, json=payload)
                    
                except Exception as retry_error:
                    print(f"❌ Failed to auto-fill custom questions: {retry_error}")
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Error registering for webinar {webinar_id}: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"📄 Response status: {e.response.status_code}")
                print(f"📄 Response body: {e.response.text}")
            raise

    def get_webinar_registrants(self, webinar_id: str, status: str = "pending") -> dict:
        """Get registrants for a webinar with specific status (pending, approved, denied)"""
        token = self.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}"
        }
        
        url = f"https://api.zoom.us/v2/webinars/{webinar_id}/registrants?status={status}"
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching webinar {webinar_id} registrants:", e)
            raise

    def update_registrant_status(self, webinar_id: str, registrant_id: str, action: str) -> dict:
        """Update registrant status (approve, deny, cancel)"""
        token = self.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "action": action,
            "registrants": [{"id": registrant_id}]
        }
        
        url = f"https://api.zoom.us/v2/webinars/{webinar_id}/registrants/status"
        try:
            response = requests.patch(url, headers=headers, json=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error updating registrant status for webinar {webinar_id}:", e)
            print(f"Response: {response.text if 'response' in locals() else 'No response'}")
            raise
