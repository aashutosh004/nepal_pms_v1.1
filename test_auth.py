import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_login_superadmin():
    print("\n--- Testing Super Admin Login ---")
    payload = {
        "userId": "superadmin@nimb",
        "password": "Admin@123"
    }
    try:
        res = requests.post(f"{BASE_URL}/login", json=payload, timeout=5)
        if res.status_code == 200:
            print("SUCCESS: Login successful")
            print(res.json())
            return True
        else:
            print(f"FAILED: {res.status_code} - {res.text}")
            return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_create_user_invalid():
    print("\n--- Testing Invalid User Creation ---")
    # Invalid ID (no @nimb)
    payload = {
        "name": "Test User",
        "address": "Test Address",
        "email": "test@example.com",
        "phone": "1234567890",
        "role": "Investment Manager",
        "userId": "testuser", 
        "password": "Password@123"
    }
    res = requests.post(f"{BASE_URL}/users/create", json=payload, timeout=5)
    if res.status_code == 400:
        print("SUCCESS: Rejected invalid User ID")
    else:
        print(f"FAILED: Accepted invalid User ID - {res.status_code}")

    # Invalid Password (no number)
    payload["userId"] = "testuser@nimb"
    payload["password"] = "Password!"
    res = requests.post(f"{BASE_URL}/users/create", json=payload, timeout=5)
    if res.status_code == 400:
        print("SUCCESS: Rejected invalid Password")
    else:
        print(f"FAILED: Accepted invalid Password - {res.status_code}")

def test_create_user_valid():
    print("\n--- Testing Valid User Creation ---")
    payload = {
        "name": "IM User",
        "address": "Kathmandu",
        "email": "im@nimb.com",
        "phone": "9800000000",
        "role": "Investment Manager",
        "userId": "im1@nimb",
        "password": "Pass@123"
    }
    
    # Check if already exists (might fail if run multiple times)
    res = requests.post(f"{BASE_URL}/users/create", json=payload, timeout=5)
    if res.status_code == 200:
        print("SUCCESS: User created")
        return True
    elif "already exists" in res.text:
        print("INFO: User already exists")
        return True
    else:
        print(f"FAILED: {res.status_code} - {res.text}")
        return False

def test_login_new_user():
    print("\n--- Testing New User Login ---")
    payload = {
        "userId": "im1@nimb",
        "password": "Pass@123"
    }
    res = requests.post(f"{BASE_URL}/login", json=payload, timeout=5)
    if res.status_code == 200:
        print("SUCCESS: Login successful")
        print(res.json())
    else:
        print(f"FAILED: {res.status_code} - {res.text}")

if __name__ == "__main__":
    if test_login_superadmin():
        test_create_user_invalid()
        if test_create_user_valid():
            test_login_new_user()
