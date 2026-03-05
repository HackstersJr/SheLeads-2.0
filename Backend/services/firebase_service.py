import os
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase only if it hasn't been initialized
if not firebase_admin._apps:
    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "./credentials.json")
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        # Dummy init for development if credentials missing but requested
        print(f"WARNING: Firebase credentials not found at {cred_path}. Firestore calls will fail.")
        
def get_db():
    if not firebase_admin._apps:
        raise Exception("Firebase app is not initialized.")
    return firestore.client()
