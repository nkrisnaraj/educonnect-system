import datetime
from django.utils import timezone
from django.utils.timezone import now
from django.utils.dateparse import parse_datetime

from .zoom_api import ZoomAPIClient
from .models import ZoomWebinar, ZoomOccurrence


class ZoomWebinarService:
    def __init__(self, account_key):
        self.account_key = account_key
        self.zoom_client = ZoomAPIClient(account_key)
        if not self.zoom_client:
            raise ValueError("Invalid Zoom account key provided")
        
    from django.utils.dateparse import parse_datetime
    from django.utils.timezone import now

    def create_and_save_webinar(self, *, topic, start_time, duration, agenda="", repeat_type="weekly", repeat_interval=1, end_date_time=None, weekly_days=None,end_times=None):
        """
        Create a recurring Zoom webinar and store it in the DB.
        """

        if not weekly_days:
            weekly_days = []  # default to empty list

        try:
            zoom_response = self.zoom_client.create_webinar(
                topic=topic,
                start_time=start_time.isoformat() if hasattr(start_time, "isoformat") else start_time,  # Convert to ISO string if datetime
                duration=duration,
                agenda=agenda,
                repeat_type=repeat_type,
                repeat_interval=repeat_interval,
                end_date_time=end_date_time.isoformat() if hasattr(end_date_time, "isoformat") else end_date_time,
                end_times=end_times,
                weekly_days=weekly_days,
            )

            webinar_id = str(zoom_response["id"])
            registration_url = zoom_response.get("join_url") or zoom_response.get("registration_url")

            # Save main webinar record
            webinar_obj, _ = ZoomWebinar.objects.update_or_create(
                webinar_id=webinar_id,
                defaults={
                    "account_key": self.account_key,
                    "topic": topic,
                    "registration_url": registration_url,
                    "start_time": start_time,
                    "duration": duration,
                    "agenda": agenda,
                    "is_recurring": True,
                }
            )

            # Save occurrences if present
            occurrences = zoom_response.get("occurrences", [])
            for occ in occurrences:
                occ_start_time = parse_datetime(occ["start_time"])
                if not occ_start_time or occ_start_time < now():
                    continue

                ZoomOccurrence.objects.update_or_create(
                    webinar=webinar_obj,
                    occurrence_id=occ["occurrence_id"],
                    defaults={
                        "start_time": occ_start_time,
                        "duration": occ.get("duration"),
                    }
                )

            # Serialize datetime fields in zoom_response for JSON safety
            zoom_response["start_time"] = zoom_response.get("start_time")
            if isinstance(zoom_response.get("start_time"), (datetime.datetime, datetime.date)):
                zoom_response["start_time"] = zoom_response["start_time"].isoformat()

            for occ in zoom_response.get("occurrences", []):
                if "start_time" in occ and isinstance(occ["start_time"], (datetime.datetime, datetime.date)):
                    occ["start_time"] = occ["start_time"].isoformat()

            return webinar_obj, zoom_response

        except Exception as e:
            print(f"[ZoomWebinarService] Failed to create webinar: {e}")
            raise

    def sync_webinars_to_db(self):
        webinars_data = self.zoom_client.list_webinars()
        webinars = webinars_data.get("webinars", [])

        def parse_and_keep_utc(dt_str):
            dt = parse_datetime(dt_str)
            return dt  # Keep as aware UTC datetime

        for webinar in webinars:
            try:
                webinar_id = str(webinar["id"])
                detail = self.zoom_client.get_webinar_detail(webinar_id)

                webinar_type = detail.get("type")
                raw_start_time = detail.get("start_time")
                occurrences = detail.get("occurrences", [])

                if webinar_type != 9:
                    if not raw_start_time or not isinstance(raw_start_time, str):
                        print(f"Skipping webinar {webinar_id}: invalid or missing start_time")
                        continue

                    start_time = parse_and_keep_utc(raw_start_time)
                    if not start_time:
                        print(f"Skipping webinar {webinar_id}: unable to parse start_time")
                        continue

                    if start_time < now():
                        print(f"Skipping past one-time webinar {webinar_id}")
                        continue

                else:
                    future_occurrences = []
                    for occ in occurrences:
                        occ_start_time_raw = occ.get("start_time")
                        if occ_start_time_raw and isinstance(occ_start_time_raw, str):
                            occ_start_time = parse_and_keep_utc(occ_start_time_raw)
                            if occ_start_time and occ_start_time >= now():
                                future_occurrences.append(occ_start_time)

                    if not future_occurrences:
                        print(f"Skipping recurring webinar {webinar_id}: no future occurrences")
                        continue

                    start_time = min(future_occurrences)

                if occurrences:
                    registration_url = f"https://zoom.us/webinar/register/{webinar_id}"
                else:
                    registration_url = f"https://zoom.us/webinar/join/{webinar_id}"

                webinar_obj, _ = ZoomWebinar.objects.update_or_create(
                    webinar_id=webinar_id,
                    defaults={
                        "account_key": self.account_key,
                        "topic": detail.get("topic"),
                        "registration_url": registration_url,
                        "start_time": start_time,
                        "duration": detail.get("duration"),
                        "agenda": detail.get("agenda", ""),
                        "is_recurring": bool(occurrences),
                    }
                )

                if occurrences:
                    for occ in occurrences:
                        occ_start_time_raw = occ.get("start_time")
                        if not occ_start_time_raw or not isinstance(occ_start_time_raw, str):
                            continue
                        occ_start_time = parse_and_keep_utc(occ_start_time_raw)
                        if not occ_start_time:
                            continue

                        if occ_start_time >= now():
                            ZoomOccurrence.objects.update_or_create(
                                webinar=webinar_obj,
                                occurrence_id=occ["occurrence_id"],
                                defaults={
                                    "start_time": occ_start_time,
                                    "duration": occ.get("duration"),
                                }
                            )

            except Exception as e:
                print(f"Error syncing webinar {webinar.get('id')}: {e}")
    # def sync_webinars_to_db(self):
    #     webinars_data = self.zoom_client.list_webinars()
    #     webinars = webinars_data.get("webinars", [])

    #     for webinar in webinars:
    #         try:
    #             webinar_id = str(webinar["id"])
    #             detail = self.zoom_client.get_webinar_detail(webinar_id)
    #             occurrences = detail.get("occurrences", [])
    #             if(bool(occurrences)):
    #                 registration_url = f"https://zoom.us/webinar/register/{webinar_id}"
    #             else:
    #                 registration_url = f"https://zoom.us/webinar/join/{webinar_id}"
                
    #             # Upsert webinar
    #             webinar_obj, _ = ZoomWebinar.objects.update_or_create(
    #                 webinar_id=webinar_id,
    #                 defaults={
    #                     "account_key": self.account_key,
    #                     "topic": webinar.get("topic"),
    #                     "registration_url": registration_url,
    #                     "start_time": parse_datetime(webinar.get("start_time")),
    #                     "duration": webinar.get("duration"),
    #                     "agenda": webinar.get("agenda", ""),
    #                     "is_recurring": bool(occurrences),
    #                 }
    #             )

    #             if occurrences:
    #                 for occ in occurrences:
    #                     ZoomOccurrence.objects.update_or_create(
    #                         webinar=webinar_obj,
    #                         occurrence_id=occ["occurrence_id"],
    #                         defaults={
    #                             "start_time": parse_datetime(occ["start_time"]),
    #                             "duration": occ["duration"],
    #                         }
    #                     )
    #         except Exception as e:
    #             print(f"Error syncing webinar {webinar.get('id')}: {e}")

    def get_all_detailed_webinars(self):
        webinars_data = self.zoom_client.list_webinars()
        webinars = webinars_data.get("webinars", [])

        detailed_webinars = []
        for webinar in webinars:
            try:
                webinar_id = webinar["id"]
                detail = self.zoom_client.get_webinar_detail(webinar_id)
                webinar["occurrences"] = detail.get("occurrences", [])
            except Exception as e:
                print(f"Error fetching details for webinar {webinar_id}: {str(e)}")
            detailed_webinars.append(webinar)

        return detailed_webinars

