import requests
import json

try:
    r = requests.post("http://localhost:8000/chat", json={"message": "Hello", "session_id": "test"}, timeout=30)
    print(f"Status: {r.status_code}")
    print(f"Response: {json.dumps(r.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
