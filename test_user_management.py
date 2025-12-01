import requests

BASE_URL = "http://localhost:8000/api"

def test_get_users():
    print("\n--- Testing GET /api/users ---")
    try:
        res = requests.get(f"{BASE_URL}/users", timeout=5)
        if res.status_code == 200:
            users = res.json()
            print(f"SUCCESS: Retrieved {len(users)} users")
            for u in users:
                print(f" - {u['userId']} ({u['role']})")
            return True
        else:
            print(f"FAILED: {res.status_code} - {res.text}")
            return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_delete_superadmin():
    print("\n--- Testing Delete Super Admin ---")
    try:
        res = requests.delete(f"{BASE_URL}/users/superadmin@nimb", timeout=5)
        if res.status_code == 403:
            print("SUCCESS: Prevented deletion of Super Admin")
        else:
            print(f"FAILED: Expected 403, got {res.status_code}")
    except Exception as e:
        print(f"ERROR: {e}")

def test_delete_user():
    print("\n--- Testing Delete User ---")
    # First create a dummy user
    payload = {
        "name": "Delete Me",
        "address": "Nowhere",
        "email": "delete@nimb.com",
        "phone": "0000000000",
        "role": "Investment Manager",
        "userId": "delete@nimb",
        "password": "Pass@123"
    }
    requests.post(f"{BASE_URL}/users/create", json=payload, timeout=5)
    
    # Now delete it
    try:
        res = requests.delete(f"{BASE_URL}/users/delete@nimb", timeout=5)
        if res.status_code == 200:
            print("SUCCESS: User deleted")
        else:
            print(f"FAILED: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    if test_get_users():
        test_delete_superadmin()
        test_delete_user()
