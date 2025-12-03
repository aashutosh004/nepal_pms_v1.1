from sqlalchemy.orm import Session
from backend.models import SessionLocal, engine, init_db, User, Asset, Portfolio, Holding
from datetime import datetime
import random
import csv
import os

def seed_data():
    init_db()
    db = SessionLocal()

    # Check if data exists
    if db.query(User).first():
        print("Data already exists. Skipping seed.")
        db.close()
        return

    print("Seeding data...")

    # 1. Create User
    user = User(Name="NIMB Manager", Email="manager@nimb.com.np", Role="Investment Manager")
    db.add(user)
    db.commit()
    db.refresh(user)

    # 2. Create Assets (Read from CSV)
    csv_path = os.path.join(os.path.dirname(__file__), 'stocks.csv')
    assets = []
    
    try:
        with open(csv_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                asset = Asset(
                    AssetName=row['AssetName'],
                    TickerSymbol=row['TickerSymbol'],
                    AssetType=row['AssetType'],
                    CurrentPrice=float(row['CurrentPrice'])
                )
                db.add(asset)
                assets.append(asset)
    except FileNotFoundError:
        print(f"Error: {csv_path} not found.")
        db.close()
        return

    db.commit()
    for a in assets: db.refresh(a)

    # 3. Create Portfolio (70% Equity to test breach)
    # Target: 1,000,000 Total. 700k Equity, 300k Debt.
    portfolio = Portfolio(UserID=user.UserID, PortfolioName="High Growth Fund", TotalValue=0.0)
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)

    # Add Holdings
    # Equity: 700k
    # Buy 200 NABIL @ 1250 = 250,000
    # Buy 200 HDL @ 3200 = 640,000 (Wait, that's too much). 
    # Let's do:
    # 100 NABIL @ 1250 = 125,000
    # 100 HDL @ 3200 = 320,000
    # 200 NICA @ 750 = 150,000
    # 100 SHIVM @ 550 = 55,000
    # 100 NTC @ 900 = 90,000
    # Total Equity = 125k + 320k + 150k + 55k + 90k = 740,000

    # Debt: 260k
    # 260 NIMBD85 @ 1000 = 260,000
    
    # Total = 1,000,000
    # Equity % = 74% (> 50% Breach)

    holdings_data = [
        ("NABIL", 100, 1250.0),
        ("HDL", 100, 3200.0),
        ("NICA", 200, 750.0),
        ("SHIVM", 100, 550.0),
        ("NTC", 100, 900.0),
        ("NIMBD85", 260, 1000.0) # Debt
    ]

    total_value = 0
    for ticker, qty, price in holdings_data:
        # Find asset safely
        asset = next((a for a in assets if a.TickerSymbol == ticker), None)
        if not asset:
            print(f"Warning: Asset {ticker} not found in seeded assets.")
            continue
            
        holding = Holding(
            PortfolioID=portfolio.PortfolioID,
            AssetID=asset.AssetID,
            Quantity=qty,
            PurchasePrice=price,
            PurchaseDate=datetime.utcnow()
        )
        db.add(holding)
        total_value += qty * price
    
    portfolio.TotalValue = total_value
    db.commit()

    print(f"Seeding complete. Created Portfolio '{portfolio.PortfolioName}' with Total Value: {total_value}")
    db.close()

if __name__ == "__main__":
    seed_data()
