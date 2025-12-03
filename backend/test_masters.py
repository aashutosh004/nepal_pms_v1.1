import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from backend.main import app
from backend.models import init_db

client = TestClient(app)

def test_equity():
    print("Testing Equity Master...")
    data = {
        "SecurityName": "Test Equity",
        "ISIN": "INE123456789",
        "TickerNSE": "TESTEQ",
        "Status": "Active",
        "FaceValue": 10,
        "LotSize": 1
    }
    try:
        # Create
        res = client.post("/api/equity-master", json=data)
        print(f"Create Status: {res.status_code}")
        if res.status_code != 200:
            print(res.text)

        # List
        res = client.get("/api/equity-master")
        print(f"List Status: {res.status_code}")
        items = res.json()
        found = any(i['ISIN'] == 'INE123456789' for i in items)
        print(f"Found created item: {found}")
    except Exception as e:
        print(f"Error: {e}")

def test_bond():
    print("\nTesting Bond Master...")
    data = {
        "BondName": "Test Bond",
        "ISIN": "INE987654321",
        "FaceValue": 1000,
        "CouponRate": 8.5,
        "IssueSize": 100000,
        "CreditRating": "AAA"
    }
    try:
        # Create
        res = client.post("/api/bond-master", json=data)
        print(f"Create Status: {res.status_code}")
        if res.status_code != 200:
            print(res.text)

        # List
        res = client.get("/api/bond-master")
        print(f"List Status: {res.status_code}")
        items = res.json()
        found = any(i['ISIN'] == 'INE987654321' for i in items)
        print(f"Found created item: {found}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    init_db() # Ensure tables exist
    test_equity()
    test_bond()
