import httpx
import sys

base_url = "http://localhost:8000"

# 1. Login to get token
resp = httpx.post(f"{base_url}/auth/demo")
if resp.status_code != 200:
    print(f"Login failed: {resp.text}")
    sys.exit(1)

token = resp.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 2. Test /ai/enhance
enhance_payload = {"text": "Developed a web app.", "context": "project description"}
resp = httpx.post(f"{base_url}/ai/enhance", json=enhance_payload, headers=headers, timeout=60.0)
print(f"Enhance: {resp.status_code} - {resp.text}")

# 3. Test /ai/chat
chat_payload = {"question": "What is their skill level in React?", "user_id": 1, "session_id": "test_session"}
resp = httpx.post(f"{base_url}/ai/chat", json=chat_payload, headers=headers, timeout=60.0)
print(f"Chat: {resp.status_code} - {resp.text}")

# 4. Test /ai/analyze
resp = httpx.post(f"{base_url}/ai/analyze", json={}, headers=headers, timeout=60.0)
print(f"Analyze: {resp.status_code} - {resp.text}")
