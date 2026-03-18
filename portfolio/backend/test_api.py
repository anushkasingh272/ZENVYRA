import requests
import json

BASE_URL = "http://localhost:8000"

def test_root():
    print("Testing root endpoint...")
    r = requests.get(f"{BASE_URL}/")
    print(f"✓ Root: {r.json()}")

def test_demo():
    print("\nTesting demo endpoint...")
    r = requests.post(f"{BASE_URL}/auth/demo")
    if r.status_code == 200:
        data = r.json()
        print(f"✓ Demo user created/logged in")
        return data["access_token"]
    else:
        print(f"✗ Demo failed: {r.text}")
        return None

def test_me(token):
    print("\nTesting /auth/me endpoint...")
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    if r.status_code == 200:
        user = r.json()
        print(f"✓ User: {user['full_name']} (@{user['username']})")
        return user
    else:
        print(f"✗ Auth failed: {r.text}")
        return None

def test_public_profile(username):
    print(f"\nTesting public profile for @{username}...")
    r = requests.get(f"{BASE_URL}/portfolio/{username}/public")
    if r.status_code == 200:
        profile = r.json()
        print(f"✓ Profile loaded: {len(profile['projects'])} projects, {len(profile['skills'])} skills")
    else:
        print(f"✗ Profile failed: {r.text}")

def test_chat(user_id):
    print(f"\nTesting chat endpoint...")
    payload = {
        "question": "What are the key skills?",
        "user_id": user_id,
        "session_id": "test_session"
    }
    r = requests.post(f"{BASE_URL}/ai/chat", json=payload)
    if r.status_code == 200:
        answer = r.json()["answer"]
        print(f"✓ Chat response: {answer[:100]}...")
    else:
        print(f"✗ Chat failed: {r.text}")

def test_enhance(token):
    print(f"\nTesting AI enhance endpoint...")
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "text": "Built a web app with React",
        "context": "project description"
    }
    r = requests.post(f"{BASE_URL}/ai/enhance", json=payload, headers=headers)
    if r.status_code == 200:
        enhanced = r.json()["enhanced_text"]
        print(f"✓ Enhanced: {enhanced[:100]}...")
    else:
        print(f"✗ Enhance failed: {r.text}")

if __name__ == "__main__":
    print("=" * 50)
    print("Backend API Test Suite")
    print("=" * 50)
    
    try:
        test_root()
        token = test_demo()
        if token:
            user = test_me(token)
            if user:
                test_public_profile(user["username"])
                test_chat(user["id"])
                test_enhance(token)
        
        print("\n" + "=" * 50)
        print("✓ All tests completed!")
        print("=" * 50)
    except Exception as e:
        print(f"\n✗ Error: {e}")
