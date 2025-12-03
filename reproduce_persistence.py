import requests
import json
import urllib.parse
import random
import string

BASE_URL = "http://localhost:8000"

def get_random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

def get_random_phone():
    return ''.join(random.choices(string.digits, k=10))

def test_persistence():
    rand_suffix = get_random_string(4)
    user_id = f"testuser{rand_suffix}@nimb"
    email = f"testuser{rand_suffix}@example.com"
    phone = get_random_phone()
    
    user_data = {
        "userId": user_id,
        "password": "Password@123",
        "name": f"Test User {rand_suffix}",
        "email": email,
        "phone": phone,
        "role": "Investment Manager",
        "address": "Test Address"
    }
    
    print(f"Creating user {user_id}...")
    try:
        resp = requests.post(f"{BASE_URL}/api/users/create", json=user_data)
        if resp.status_code == 200:
            print("User created successfully.")
        else:
            print(f"Failed to create user: {resp.text}")
            return
    except Exception as e:
        print(f"Error creating user: {e}")
        return

    # 2. Verify User Exists
    print("Verifying user exists...")
    resp = requests.get(f"{BASE_URL}/api/users")
    users = resp.json()
    found = False
    for u in users:
        if u['userId'] == user_id:
            found = True
            break
    
    if found:
        print("User found in DB.")
    else:
        print("User NOT found in DB!")
        print("Current users:", [u['userId'] for u in users])
        return

    # 3. Create Portfolio
    print("Creating portfolio...")
    portfolio_data = {
        "userId": user_id,
        "portfolioId": f"TEST{rand_suffix}",
        "portfolioType": "Discretionary",
        "productType": "EQ",
        "portfolioLevel": "Standard",
        "riskLevel": "Moderate",
        "relationshipManager": "RM Test",
        "bankName": "Test Bank",
        "bankAccountNo": "1234567890",
        "ifscCode": "TEST001",
        "brokerName": "Test Broker",
        "brokerAccountNo": "987654321",
        "nomineeName": "Nominee Test",
        "allocationPercentage": 100.0,
        "relationship": "Self"
    }
    
    resp = requests.post(f"{BASE_URL}/api/portfolio/create", json=portfolio_data)
    if resp.status_code == 200:
        print("Portfolio created successfully.")
        pid = resp.json().get("id")
    else:
        print(f"Failed to create portfolio: {resp.text}")
        pid = None

    # 4. Verify Portfolio
    if pid:
        print(f"Verifying portfolio {pid}...")
        resp = requests.get(f"{BASE_URL}/portfolio/{pid}")
        if resp.status_code == 200:
            print("Portfolio found in DB.")
        else:
            print("Portfolio NOT found in DB!")

    # 5. Delete User (Cleanup)
    print(f"Deleting user {user_id}...")
    # URL encode the ID
    encoded_id = urllib.parse.quote(user_id)
    resp = requests.delete(f"{BASE_URL}/api/users/{encoded_id}")
    if resp.status_code == 200:
        print("User deleted successfully.")
    else:
        print(f"Failed to delete user: {resp.text}")

if __name__ == "__main__":
    test_persistence()
