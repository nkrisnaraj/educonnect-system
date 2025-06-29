import os
import json
import tempfile

def setup_google_credentials():
    creds_json_str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")
    if not creds_json_str:
        print("GOOGLE_APPLICATION_CREDENTIALS_JSON not set")
        return False
    
    creds_json_str = creds_json_str.strip("'")
    try:
        creds_dict = json.loads(creds_json_str)
        if "private_key" in creds_dict:
            creds_dict["private_key"] = creds_dict["private_key"].replace("\\n", "\n")
        with tempfile.NamedTemporaryFile(mode='w+', delete=False, suffix='.json') as temp_file:
            json.dump(creds_dict, temp_file)
            temp_file_path = temp_file.name
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = temp_file_path
        print(f"✅ Google credentials written to temp file at: {temp_file_path}")
        return True
    except json.JSONDecodeError as e:
        print("❌ Error parsing GOOGLE_APPLICATION_CREDENTIALS_JSON:", e)
        return False
