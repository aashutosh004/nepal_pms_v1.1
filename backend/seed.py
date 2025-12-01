from sqlalchemy.orm import Session
from models import SessionLocal, engine, init_db, User, Asset, Portfolio, Holding
from datetime import datetime
import random

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

    # 2. Create Assets (20 NEPSE Stocks)
    nepse_stocks = [
        ("Nabil Bank", "NABIL", "Equity", 1250.0),
        ("NIC Asia Bank", "NICA", "Equity", 750.0),
        ("Shivam Cements", "SHIVM", "Equity", 550.0),
        ("Himalayan Distillery", "HDL", "Equity", 3200.0),
        ("Nepal Telecom", "NTC", "Equity", 900.0),
        ("Upper Tamakoshi", "UPPER", "Equity", 450.0),
        ("Nepal Life Insurance", "NLIC", "Equity", 1100.0),
        ("Citizen Investment Trust", "CIT", "Equity", 2800.0),
        ("Salt Trading", "STC", "Equity", 4500.0),
        ("Nepal Reinsurance", "NRIC", "Equity", 850.0),
        ("Global IME Bank", "GBIME", "Equity", 280.0),
        ("Prabhu Bank", "PRVU", "Equity", 240.0),
        ("Siddhartha Bank", "SBL", "Equity", 310.0),
        ("Sanima Bank", "SANIMA", "Equity", 330.0),
        ("Everest Bank", "EBL", "Equity", 520.0),
        ("Standard Chartered", "SCB", "Equity", 510.0),
        ("Nepal Investment Mega", "NIMB", "Equity", 260.0), # The client!
        ("Agricultural Dev Bank", "ADBL", "Equity", 380.0),
        ("NMB Bank", "NMB", "Equity", 290.0),
        ("Nepal Bank", "NBL", "Equity", 270.0),
        ("NIMB Debenture 2085", "NIMBD85", "Debt", 1000.0),
        ("Nabil Debenture", "NABILD", "Debt", 1000.0),
        ("Govt Bond 2080", "GB2080", "Debt", 1000.0),
    ]

    assets = []
    for name, ticker, type_, price in nepse_stocks:
        asset = Asset(AssetName=name, TickerSymbol=ticker, AssetType=type_, CurrentPrice=price)
        db.add(asset)
        assets.append(asset)
    
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
        asset = next(a for a in assets if a.TickerSymbol == ticker)
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
