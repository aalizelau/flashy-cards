import os
import firebase_admin
from dotenv import load_dotenv
import os
import json
from firebase_admin import credentials

load_dotenv()


def initialize_firebase():
    """
    Initialize Firebase Admin SDK
    """
    if not firebase_admin._apps:
        # Try to use service account key file if available
        service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
        if service_account_json:
            service_account_json = json.loads(service_account_json)
        
        if service_account_json:
            # Use service account key file
            cred = credentials.Certificate(service_account_json)
            firebase_admin.initialize_app(cred)
        else:
            # Use default credentials (for production environments)
            # This works when running on Google Cloud or with GOOGLE_APPLICATION_CREDENTIALS
            firebase_admin.initialize_app()
        
        print("Firebase Admin SDK initialized successfully")
    else:
        print("Firebase Admin SDK already initialized")


# Initialize Firebase when module is imported
initialize_firebase()