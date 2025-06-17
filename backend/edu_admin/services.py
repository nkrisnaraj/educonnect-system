from .zoom_api import ZoomAPIClient

class ZoomWebinarService:
    def __init__(self, account_key):
        self.zoom_client = ZoomAPIClient(account_key)
        if not self.zoom_client:
            raise ValueError("Invalid Zoom account key provided")
    
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

