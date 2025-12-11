from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from backend.models import SessionLocal, Portfolio, Holding, Asset, init_db
from pydantic import BaseModel
from typing import List, Optional
import csv
import io
import pandas as pd
import re
import hashlib
from backend.models import SessionLocal, Portfolio, Holding, Asset, User, EquityMaster, BondMaster, init_db

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB (Simple way to ensure tables exist if DB was deleted)
init_db()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Models for API Responses
class AssetModel(BaseModel):
    AssetName: str
    TickerSymbol: str
    AssetType: str
    CurrentPrice: float

class HoldingModel(BaseModel):
    Asset: AssetModel
    Quantity: int
    PurchasePrice: float
    MarketValue: float
    Allocation: float
    GainLoss: float

class PortfolioResponse(BaseModel):
    PortfolioID: int
    PortfolioName: str
    TotalValue: float
    Holdings: List[HoldingModel]
    EquityValue: float
    DebtValue: float
    MutualFundValue: float
    EquityPercent: float
    DebtPercent: float
    MutualFundPercent: float
    
    # Client Details
    UserID: Optional[str] = None
    PortfolioType: Optional[str] = None
    ProductType: Optional[str] = None
    PortfolioLevel: Optional[str] = None
    RiskLevel: Optional[str] = None
    RelationshipManager: Optional[str] = None
    BankName: Optional[str] = None
    BankAccountNo: Optional[str] = None
    IfscCode: Optional[str] = None
    BrokerName: Optional[str] = None
    BrokerAccountNo: Optional[str] = None
    NomineeName: Optional[str] = None
    AllocationPercentage: Optional[float] = None
    Relationship: Optional[str] = None

class RebalanceProposal(BaseModel):
    Action: str # Sell Equity, Buy Debt
    Amount: float
    Description: str

class ReconBreak(BaseModel):
    TradeID: str
    Type: str # Missing in X, Mismatch
    Details: str

class ReconSummary(BaseModel):
    TotalRecords: int
    Matched: int
    MissingOrphans: int
    AmountMismatches: int
    Breaks: List[ReconBreak]

class ClientCreationRequest(BaseModel):
    userId: str
    portfolioId: str
    portfolioType: str
    productType: str
    portfolioLevel: str
    riskLevel: str
    relationshipManager: str
    bankName: str
    bankAccountNo: str
    ifscCode: str
    brokerName: str
    brokerAccountNo: str
    nomineeName: str
    allocationPercentage: Optional[float] = 0.0
    allocationPercentage: Optional[float] = 0.0
    relationship: str

class UserCreateSchema(BaseModel):
    name: str
    address: str
    email: str
    phone: str
    role: str
    userId: str
    password: str

class LoginSchema(BaseModel):
    userId: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    role: str
    name: str
    userId: str

@app.get("/portfolio/{portfolio_id}", response_model=PortfolioResponse)
def get_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    portfolio = db.query(Portfolio).filter(Portfolio.PortfolioID == portfolio_id).first()
    
    if not portfolio:
        # For demo purposes, if ID 1 doesn't exist, create a dummy one
        if portfolio_id == 1:
            dummy = Portfolio(
                PortfolioID=1, 
                PortfolioName="Demo Portfolio", 
                TotalValue=100000,
                PortfolioType="Discretionary",
                ProductType="EQ",
                PortfolioLevel="VIP",
                RiskLevel="High",
                RelationshipManager="John Doe",
                BankName="NIMB Bank",
                BankAccountNo="1234567890",
                IfscCode="NIMB001",
                BrokerName="Broker X",
                BrokerAccountNo="987654321",
                NomineeName="Jane Doe",
                AllocationPercentage=100,
                Relationship="Spouse"
            )
            db.add(dummy)
            db.commit()
            db.refresh(dummy)
            portfolio = dummy
        else:
            raise HTTPException(status_code=404, detail="Portfolio not found")

    # Ensure holdings exist for ID 1
    if portfolio_id == 1:
        holdings_count = db.query(Holding).filter(Holding.PortfolioID == 1).count()
        
        if holdings_count == 0:
            assets = [
                Asset(AssetName="Nabil Bank", TickerSymbol="NABIL", AssetType="Equity", CurrentPrice=1200),
                Asset(AssetName="Govt Bond 2085", TickerSymbol="GB85", AssetType="Debt", CurrentPrice=1000),
                Asset(AssetName="NIBL Sahabhagita Fund", TickerSymbol="NIBLSF", AssetType="Mutual Fund", CurrentPrice=15)
            ]
            for a in assets:
                existing = db.query(Asset).filter(Asset.TickerSymbol == a.TickerSymbol).first()
                if not existing:
                    db.add(a)
                    db.commit()
                    db.refresh(a)
                else:
                    a = existing
                
                # Add Holding
                h = Holding(PortfolioID=1, AssetID=a.AssetID, Quantity=100 if a.AssetType != "Mutual Fund" else 5000, PurchasePrice=a.CurrentPrice * 0.9)
                db.add(h)
            db.commit()

    holdings_data = []
    equity_val = 0.0
    debt_val = 0.0
    mf_val = 0.0
    total_val = 0.0

    # Explicitly query holdings
    holdings = db.query(Holding).filter(Holding.PortfolioID == portfolio.PortfolioID).all()

    # Calculate current market value
    for holding in holdings:
        market_val = holding.Quantity * holding.asset.CurrentPrice
        total_val += market_val
        
        if holding.asset.AssetType == "Equity":
            equity_val += market_val
        elif holding.asset.AssetType == "Debt":
            debt_val += market_val
        elif holding.asset.AssetType == "Mutual Fund":
            mf_val += market_val

        holdings_data.append({
            "Asset": {
                "AssetName": holding.asset.AssetName,
                "TickerSymbol": holding.asset.TickerSymbol,
                "AssetType": holding.asset.AssetType,
                "CurrentPrice": holding.asset.CurrentPrice
            },
            "Quantity": holding.Quantity,
            "PurchasePrice": holding.PurchasePrice,
            "MarketValue": market_val,
            "Allocation": 0, # To be calc
            "GainLoss": market_val - (holding.Quantity * holding.PurchasePrice)
        })
    
    # Update allocation %
    if total_val > 0:
        for h in holdings_data:
            h["Allocation"] = (h["MarketValue"] / total_val) * 100

    return {
        "PortfolioID": portfolio.PortfolioID,
        "PortfolioName": portfolio.PortfolioName,
        "TotalValue": total_val,
        "Holdings": holdings_data,
        "EquityValue": equity_val,
        "DebtValue": debt_val,
        "MutualFundValue": mf_val,
        "EquityPercent": (equity_val / total_val * 100) if total_val > 0 else 0,
        "DebtPercent": (debt_val / total_val * 100) if total_val > 0 else 0,
        "MutualFundPercent": (mf_val / total_val * 100) if total_val > 0 else 0,
        
        # Client Details
        "UserID": f"USER-{portfolio.PortfolioID}",
        "PortfolioType": portfolio.PortfolioType,
        "ProductType": portfolio.ProductType,
        "PortfolioLevel": portfolio.PortfolioLevel,
        "RiskLevel": portfolio.RiskLevel,
        "RelationshipManager": portfolio.RelationshipManager,
        "BankName": portfolio.BankName,
        "BankAccountNo": portfolio.BankAccountNo,
        "IfscCode": portfolio.IfscCode,
        "BrokerName": portfolio.BrokerName,
        "BrokerAccountNo": portfolio.BrokerAccountNo,
        "NomineeName": portfolio.NomineeName,
        "AllocationPercentage": portfolio.AllocationPercentage,
        "Relationship": portfolio.Relationship
    }

@app.get("/api/portfolios")
def get_all_portfolios(db: Session = Depends(get_db)):
    portfolios = db.query(Portfolio).all()
    results = []
    for p in portfolios:
        results.append({
            "PortfolioID": p.PortfolioID,
            "PortfolioName": p.PortfolioName,
            "TotalValue": p.TotalValue,
            "ClientName": p.NomineeName or f"Client {p.PortfolioID}",
            "UserID": f"USER-{p.PortfolioID}",
            # Full Details for Client Master Table
            "PortfolioType": p.PortfolioType,
            "ProductType": p.ProductType,
            "PortfolioLevel": p.PortfolioLevel,
            "RiskLevel": p.RiskLevel,
            "RelationshipManager": p.RelationshipManager,
            "BankName": p.BankName,
            "BankAccountNo": p.BankAccountNo,
            "IfscCode": p.IfscCode,
            "BrokerName": p.BrokerName,
            "BrokerAccountNo": p.BrokerAccountNo,
            "NomineeName": p.NomineeName,
            "AllocationPercentage": p.AllocationPercentage,
            "Relationship": p.Relationship
        })
    return results

@app.post("/api/portfolio/create")
def create_portfolio(data: ClientCreationRequest, db: Session = Depends(get_db)):
    # Create new portfolio
    new_portfolio = Portfolio(
        PortfolioName=f"Portfolio-{data.portfolioId}",
        PortfolioType=data.portfolioType,
        ProductType=data.productType,
        PortfolioLevel=data.portfolioLevel,
        RiskLevel=data.riskLevel,
        RelationshipManager=data.relationshipManager,
        BankName=data.bankName,
        BankAccountNo=data.bankAccountNo,
        IfscCode=data.ifscCode,
        BrokerName=data.brokerName,
        BrokerAccountNo=data.brokerAccountNo,
        NomineeName=data.nomineeName,
        AllocationPercentage=data.allocationPercentage,
        Relationship=data.relationship
    )
    db.add(new_portfolio)
    db.commit()
    db.refresh(new_portfolio)
    return {"message": "Portfolio created successfully", "id": new_portfolio.PortfolioID}

@app.post("/api/portfolio/upload")
async def upload_portfolio(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="Invalid file type. Only CSV and XLSX allowed.")
    
    try:
        contents = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

    # Expected Columns
    expected_columns = {
        "Portfolio Type": "PortfolioType",
        "Product Type": "ProductType",
        "Portfolio Level": "PortfolioLevel",
        "Risk Level": "RiskLevel",
        "Relationship Manager": "RelationshipManager",
        "Bank Name": "BankName",
        "Bank Acc. No": "BankAccountNo",
        "IFSC Code": "IfscCode",
        "Broker Name": "BrokerName",
        "Broker Account No.": "BrokerAccountNo",
        "Nominee Name": "NomineeName",
        "Allocation Percentage": "AllocationPercentage",
        "Relationship": "Relationship"
    }
    
    # Normalize columns
    df.columns = [c.strip() for c in df.columns]
    
    # Check for missing columns
    missing_cols = []
    mapped_data = []
    
    if df.empty:
        raise HTTPException(status_code=400, detail="File is empty.")

    errors = []
    import random

    # Validation Constants
    VALID_PORTFOLIO_TYPES = ["Discretionary", "Non-Discretionary"]
    VALID_PRODUCT_TYPES = ["EQ", "FI", "MF"]
    VALID_PORTFOLIO_LEVELS = ["Standard", "VIP", "VVIP"]
    VALID_RISK_LEVELS = ["High", "Moderate", "Low"]
    VALID_RELATIONSHIPS = ["Self", "Spouse", "Father", "Mother", "Son", "Daughter", "Sibling"]

    for index, row in df.iterrows():
        row_errors = []
        row_data = {}
        
        # 1. Map Columns
        for label, field_name in expected_columns.items():
            val = None
            if label in df.columns:
                val = row[label]
            elif field_name in df.columns:
                val = row[field_name]
            elif label.replace(".", "") in df.columns:
                 val = row[label.replace(".", "")]
            else:
                if index == 0: missing_cols.append(label) # Only report missing once
                continue
            
            row_data[field_name] = val

        if missing_cols:
             break # Stop if columns are missing

        # 2. Validate Data
        
        # Helper to safely get string
        def get_str(key):
            v = row_data.get(key)
            return str(v).strip() if pd.notna(v) else ""

        # Required Fields & Enums
        pt = get_str('PortfolioType')
        if not pt: row_errors.append("Portfolio Type is required")
        elif pt not in VALID_PORTFOLIO_TYPES: row_errors.append(f"Invalid Portfolio Type: {pt}")

        prod = get_str('ProductType')
        if not prod: row_errors.append("Product Type is required")
        elif prod not in VALID_PRODUCT_TYPES: row_errors.append(f"Invalid Product Type: {prod}")

        pl = get_str('PortfolioLevel')
        if not pl: row_errors.append("Portfolio Level is required")
        elif pl not in VALID_PORTFOLIO_LEVELS: row_errors.append(f"Invalid Portfolio Level: {pl}")

        rl = get_str('RiskLevel')
        if not rl: row_errors.append("Risk Level is required")
        elif rl not in VALID_RISK_LEVELS: row_errors.append(f"Invalid Risk Level: {rl}")

        rel = get_str('Relationship')
        if not rel: row_errors.append("Relationship is required")
        elif rel not in VALID_RELATIONSHIPS: row_errors.append(f"Invalid Relationship: {rel}")

        # Regex Validations (No special chars)
        no_special_chars = r'^[a-zA-Z0-9 ]*$'
        no_double_spaces = r'  '
        
        for field in ['RelationshipManager', 'BankName', 'BrokerName', 'NomineeName']:
            val = get_str(field)
            if not val:
                row_errors.append(f"{field} is required")
            elif not re.match(no_special_chars, val):
                row_errors.append(f"{field} contains special characters")
            elif re.search(no_double_spaces, val):
                row_errors.append(f"{field} contains double spaces")

        # Numeric Validations
        for field in ['BankAccountNo', 'BrokerAccountNo']:
            val = get_str(field)
            if not val:
                row_errors.append(f"{field} is required")
            elif not val.isdigit():
                row_errors.append(f"{field} must be numeric")

        # Alphanumeric
        ifsc = get_str('IfscCode')
        if not ifsc:
            row_errors.append("IFSC Code is required")
        elif not ifsc.isalnum():
             row_errors.append("IFSC Code must be alphanumeric")

        # Allocation Percentage
        alloc = row_data.get('AllocationPercentage')
        try:
            alloc_val = float(alloc) if pd.notna(alloc) else None
            if alloc_val is None:
                row_errors.append("Allocation Percentage is required")
            elif alloc_val < 0 or alloc_val > 100:
                row_errors.append("Allocation Percentage must be between 0 and 100")
            else:
                row_data['AllocationPercentage'] = alloc_val
        except ValueError:
            row_errors.append("Allocation Percentage must be a number")

        if row_errors:
            errors.append(f"Row {index + 2}: {', '.join(row_errors)}")
        else:
            # Generate ID
            # NIBL + ProductType + Random 6 digits
            asset_class = prod if prod in ['EQ', 'FI'] else 'XX'
            random_num = random.randint(100000, 999999)
            generated_id = f"NIBL{asset_class}{random_num}"
            
            row_data['PortfolioID_Str'] = generated_id
            mapped_data.append(row_data)

    if missing_cols:
        raise HTTPException(status_code=400, detail=f"Missing columns: {', '.join(set(missing_cols))}")

    if errors:
        raise HTTPException(status_code=400, detail=f"Validation Errors: {'; '.join(errors)}")

    # Save to DB
    created_ids = []
    for data in mapped_data:
        new_portfolio = Portfolio(
            PortfolioName=f"Portfolio-{data['PortfolioID_Str']}",
            PortfolioType=data['PortfolioType'],
            ProductType=data['ProductType'],
            PortfolioLevel=data['PortfolioLevel'],
            RiskLevel=data['RiskLevel'],
            RelationshipManager=data['RelationshipManager'],
            BankName=data['BankName'],
            BankAccountNo=str(data['BankAccountNo']),
            IfscCode=data['IfscCode'],
            BrokerName=data['BrokerName'],
            BrokerAccountNo=str(data['BrokerAccountNo']),
            NomineeName=data['NomineeName'],
            AllocationPercentage=data['AllocationPercentage'],
            Relationship=data['Relationship']
        )
        db.add(new_portfolio)
        db.commit()
        db.refresh(new_portfolio)
        created_ids.append(new_portfolio.PortfolioID)

    return {"message": "File uploaded and processed successfully", "created_ids": created_ids}

@app.delete("/api/portfolio/{portfolio_id}")
def delete_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    portfolio = db.query(Portfolio).filter(Portfolio.PortfolioID == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Delete associated data if not handled by cascade
    # For now, let's just delete the portfolio
    db.delete(portfolio)
    db.commit()
    return {"message": "Portfolio deleted successfully"}

@app.post("/rebalance/{portfolio_id}", response_model=List[RebalanceProposal])
def check_rebalance(portfolio_id: int, db: Session = Depends(get_db)):
    # Logic: If Equity > 50%, Sell Equity, Buy Debt
    portfolio_data = get_portfolio(portfolio_id, db)
    
    proposals = []
    target_equity_pct = 50.0
    
    if portfolio_data["EquityPercent"] > target_equity_pct:
        # Breach
        current_equity = portfolio_data["EquityValue"]
        total_value = portfolio_data["TotalValue"]
        target_equity = total_value * (target_equity_pct / 100)
        sell_amount = current_equity - target_equity
        
        proposals.append({
            "Action": "Sell Equity",
            "Amount": sell_amount,
            "Description": f"Equity is {portfolio_data['EquityPercent']:.1f}%. Sell {sell_amount:.2f} to reach 50%."
        })
        proposals.append({
            "Action": "Buy Debt",
            "Amount": sell_amount,
            "Description": f"Use proceeds to buy Debt assets."
        })
    
    return proposals

@app.post("/reconcile", response_model=ReconSummary)
async def reconcile_files(
    im_file: UploadFile = File(...),
    cust_file: UploadFile = File(...),
    ch_file: UploadFile = File(...)
):
    # Helper to parse CSV
    def parse_csv(file_content):
        reader = csv.DictReader(io.StringIO(file_content.decode('utf-8')))
        return {row['TradeID']: row for row in reader}

    im_data = parse_csv(await im_file.read())
    cust_data = parse_csv(await cust_file.read())
    ch_data = parse_csv(await ch_file.read())

    all_ids = set(im_data.keys()) | set(cust_data.keys()) | set(ch_data.keys())
    
    matched = 0
    missing = 0
    mismatches = 0
    breaks = []

    for trade_id in all_ids:
        im = im_data.get(trade_id)
        cust = cust_data.get(trade_id)
        ch = ch_data.get(trade_id)

        # Check for missing
        if not im or not cust or not ch:
            missing += 1
            details = []
            if not im: details.append("Missing in IM")
            if not cust: details.append("Missing in Custodian")
            if not ch: details.append("Missing in Clearing House")
            breaks.append({
                "TradeID": trade_id,
                "Type": "Missing",
                "Details": ", ".join(details)
            })
            continue

        # Check for amount mismatch
        # Assuming 'Amount' column exists
        try:
            im_amt = float(im['Amount'])
            cust_amt = float(cust['Amount'])
            ch_amt = float(ch['Amount'])
            
            if im_amt != cust_amt or im_amt != ch_amt:
                mismatches += 1
                breaks.append({
                    "TradeID": trade_id,
                    "Type": "Mismatch",
                    "Details": f"IM: {im_amt}, Cust: {cust_amt}, CH: {ch_amt}"
                })
            else:
                matched += 1
        except ValueError:
             breaks.append({
                "TradeID": trade_id,
                "Type": "Data Error",
                "Details": "Invalid Amount format"
            })

    return {
        "TotalRecords": len(all_ids),
        "Matched": matched,
        "MissingOrphans": missing,
        "AmountMismatches": mismatches,
        "Breaks": breaks
    }

# News Scraping Endpoint
import requests
from bs4 import BeautifulSoup

class NewsItem(BaseModel):
    title: str
    date: str
    link: str
    source: str

from backend.scraper import scrape_news_sync
from concurrent.futures import ProcessPoolExecutor
import asyncio

_process_executor = None

@app.on_event("startup")
async def startup_event():
    global _process_executor
    _process_executor = ProcessPoolExecutor()
    
    # Create Super Admin if not exists
    db = SessionLocal()
    try:
        super_admin = db.query(User).filter(User.UserID == "superadmin@nimb").first()
        if not super_admin:
            # Hash password
            pwd_hash = hashlib.sha256("Admin@123".encode()).hexdigest()
            new_admin = User(
                UserID="superadmin@nimb",
                PasswordHash=pwd_hash,
                Name="Super Admin",
                Address="NIMB HQ",
                Email="superadmin@nimb.com",
                Phone="9999999999",
                Role="Admin"
            )
            db.add(new_admin)
            db.commit()
            print("Super Admin created.")
    finally:
        db.close()

@app.on_event("shutdown")
async def shutdown_event():
    global _process_executor
    if _process_executor:
        _process_executor.shutdown()

@app.get("/api/news", response_model=List[NewsItem])
async def get_news(symbol: Optional[str] = None):
    loop = asyncio.get_running_loop()
    # Run in a separate process to avoid Windows Event Loop issues with Playwright
    return await loop.run_in_executor(_process_executor, scrape_news_sync, symbol)

    return await loop.run_in_executor(_process_executor, scrape_news_sync, symbol)

@app.post("/api/login", response_model=LoginResponse)
def login(creds: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.UserID == creds.userId).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid User ID or Password")
    
    # Check password
    input_hash = hashlib.sha256(creds.password.encode()).hexdigest()
    if input_hash != user.PasswordHash:
        raise HTTPException(status_code=401, detail="Invalid User ID or Password")
    
    return {
        "success": True,
        "role": user.Role,
        "name": user.Name,
        "userId": user.UserID
    }

@app.post("/api/users/create")
def create_user(user_data: UserCreateSchema, db: Session = Depends(get_db)):
    # 1. Validate User ID
    if not user_data.userId.endswith("@nimb"):
        raise HTTPException(status_code=400, detail="User ID must end with @nimb")
    if not user_data.userId.replace("@nimb", "").isalnum():
        raise HTTPException(status_code=400, detail="User ID must be alphanumeric (before @nimb)")
    if len(user_data.userId) > 20:
        raise HTTPException(status_code=400, detail="User ID must be <= 20 characters")
    
    # 2. Validate Password
    pwd = user_data.password
    if len(pwd) > 20:
        raise HTTPException(status_code=400, detail="Password must be <= 20 characters")
    if not re.search(r"\d", pwd):
        raise HTTPException(status_code=400, detail="Password must contain at least one number")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", pwd):
        raise HTTPException(status_code=400, detail="Password must contain at least one special character")
    
    # 3. Check Duplicates
    if db.query(User).filter(User.UserID == user_data.userId).first():
        raise HTTPException(status_code=400, detail="User ID already exists")
    if db.query(User).filter(User.Email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    if db.query(User).filter(User.Phone == user_data.phone).first():
        raise HTTPException(status_code=400, detail="Phone number already exists")
    
    # 4. Create User
    pwd_hash = hashlib.sha256(pwd.encode()).hexdigest()
    new_user = User(
        UserID=user_data.userId,
        PasswordHash=pwd_hash,
        Name=user_data.name,
        Address=user_data.address,
        Email=user_data.email,
        Phone=user_data.phone,
        Role=user_data.role
    )
    db.add(new_user)
    db.commit()
    
    return {"message": "User created successfully"}

@app.get("/api/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    result = []
    for u in users:
        result.append({
            "userId": u.UserID,
            "name": u.Name,
            "email": u.Email,
            "role": u.Role,
            "phone": u.Phone,
            "address": u.Address
        })
    return result

@app.delete("/api/users/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.UserID == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

# --- Security Masters ---

# Pydantic Models

class EquityMasterSchema(BaseModel):
    SecurityName: str
    ISIN: str
    TickerNSE: Optional[str] = None
    TickerBSE: Optional[str] = None
    IssuerLEI: Optional[str] = None
    Country: Optional[str] = None
    Currency: Optional[str] = None
    ListingDate: Optional[str] = None
    Status: Optional[str] = None
    AssetClass: Optional[str] = None
    SubAssetClass: Optional[str] = None
    Sector: Optional[str] = None
    Industry: Optional[str] = None
    MarketSegment: Optional[str] = None
    Identifiers: Optional[str] = None
    PrimaryExchange: Optional[str] = None
    MIC: Optional[str] = None
    FaceValue: Optional[int] = None
    LotSize: Optional[int] = None
    TickSize: Optional[str] = None
    SettlementCycle: Optional[str] = None
    TradingStatus: Optional[str] = None
    ActionType: Optional[str] = None
    EffectiveDate: Optional[str] = None
    Details: Optional[str] = None
    AdjustmentFactor: Optional[str] = None
    RegulatoryTags: Optional[str] = None
    Notes: Optional[str] = None

class BondMasterSchema(BaseModel):
    BondName: str
    ISIN: str
    Ticker: Optional[str] = None
    BBGID: Optional[str] = None
    SecurityType: Optional[str] = None
    IssueDate: Optional[str] = None
    IssueSize: Optional[int] = None
    ModeOfIssue: Optional[str] = None
    OutstandingAmount: Optional[int] = None
    MaturityDate: Optional[str] = None
    ListingStatus: Optional[str] = None
    Exchange: Optional[str] = None
    IssuerName: Optional[str] = None
    IssueType: Optional[str] = None
    CouponRate: Optional[float] = None
    CouponType: Optional[str] = None
    Frequency: Optional[str] = None
    DayCount: Optional[str] = None
    NextCouponDate: Optional[str] = None
    ResetIndex: Optional[str] = None
    FaceValue: Optional[int] = None
    Currency: Optional[str] = None
    Amortization: Optional[str] = None
    RedemptionType: Optional[str] = None
    EmbeddedOptions: Optional[str] = None
    MinTradableLot: Optional[float] = None
    CreditRating: Optional[str] = None
    RatingAgency: Optional[str] = None
    Seniority: Optional[str] = None
    Security: Optional[str] = None
    TaxStatus: Optional[str] = None
    WithholdingTDS: Optional[str] = None
    CapitalGains: Optional[str] = None
    RegulatoryTags: Optional[str] = None

# Endpoints

@app.post("/api/equity-master")
def create_equity(data: EquityMasterSchema, db: Session = Depends(get_db)):
    # Check if ISIN exists
    if db.query(EquityMaster).filter(EquityMaster.ISIN == data.ISIN).first():
        raise HTTPException(status_code=400, detail="ISIN already exists")
    
    # Convert dates
    def parse_date(d):
        if not d: return None
        try:
            return datetime.strptime(d, "%Y-%m-%d").date()
        except:
            return None

    new_equity = EquityMaster(
        SecurityName=data.SecurityName,
        ISIN=data.ISIN,
        TickerNSE=data.TickerNSE,
        TickerBSE=data.TickerBSE,
        IssuerLEI=data.IssuerLEI,
        Country=data.Country,
        Currency=data.Currency,
        ListingDate=parse_date(data.ListingDate),
        Status=data.Status,
        AssetClass=data.AssetClass,
        SubAssetClass=data.SubAssetClass,
        Sector=data.Sector,
        Industry=data.Industry,
        MarketSegment=data.MarketSegment,
        Identifiers=data.Identifiers,
        PrimaryExchange=data.PrimaryExchange,
        MIC=data.MIC,
        LotSize=data.LotSize,
        TickSize=data.TickSize,
        SettlementCycle=data.SettlementCycle,
        TradingStatus=data.TradingStatus,
        ActionType=data.ActionType,
        EffectiveDate=parse_date(data.EffectiveDate),
        Details=data.Details,
        AdjustmentFactor=data.AdjustmentFactor,
        Notes=data.Notes
    )
    db.add(new_equity)
    db.commit()
    return {"message": "Equity created successfully"}

@app.get("/api/equity-master")
def get_equities(db: Session = Depends(get_db)):
    return db.query(EquityMaster).all()

@app.post("/api/equity-master/upload")
async def upload_equity_master(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    try:
        contents = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

    # Basic mapping (assuming column names match model fields or are close)
    # For now, let's assume the user provides a template matching our schema fields
    
    success_count = 0
    errors = []

    for index, row in df.iterrows():
        try:
            # Helper to get value safely
            def get_val(col):
                return row[col] if col in df.columns and pd.notna(row[col]) else None

            isin = get_val("ISIN")
            if not isin: continue

            # Check if exists
            existing = db.query(EquityMaster).filter(EquityMaster.ISIN == isin).first()
            if existing:
                # Update or Skip? Let's update
                pass
            else:
                existing = EquityMaster(ISIN=isin)
            
            existing.SecurityName = get_val("SecurityName") or get_val("Security Name")
            existing.TickerNSE = get_val("TickerNSE") or get_val("Ticker (NSE)")
            existing.TickerBSE = get_val("TickerBSE") or get_val("Ticker (BSE)")
            existing.IssuerLEI = get_val("IssuerLEI")
            existing.Country = get_val("Country")
            existing.Currency = get_val("Currency")
            # ... map other fields as needed. For MVP, mapping key fields.
            
            if not existing.ID:
                db.add(existing)
            success_count += 1
        except Exception as e:
            errors.append(f"Row {index}: {str(e)}")
    
    db.commit()
    return {"message": f"Processed {success_count} records", "errors": errors}

@app.post("/api/bond-master")
def create_bond(data: BondMasterSchema, db: Session = Depends(get_db)):
    if db.query(BondMaster).filter(BondMaster.ISIN == data.ISIN).first():
        raise HTTPException(status_code=400, detail="ISIN already exists")

    def parse_date(d):
        if not d: return None
        try:
            return datetime.strptime(d, "%Y-%m-%d").date()
        except:
            return None

    new_bond = BondMaster(
        BondName=data.BondName,
        ISIN=data.ISIN,
        Ticker=data.Ticker,
        BBGID=data.BBGID,
        SecurityType=data.SecurityType,
        IssueDate=parse_date(data.IssueDate),
        IssueSize=data.IssueSize,
        ModeOfIssue=data.ModeOfIssue,
        OutstandingAmount=data.OutstandingAmount,
        MaturityDate=parse_date(data.MaturityDate),
        ListingStatus=data.ListingStatus,
        Exchange=data.Exchange,
        IssuerName=data.IssuerName,
        IssueType=data.IssueType,
        CouponRate=data.CouponRate,
        CouponType=data.CouponType,
        Frequency=data.Frequency,
        DayCount=data.DayCount,
        NextCouponDate=parse_date(data.NextCouponDate),
        ResetIndex=data.ResetIndex,
        FaceValue=data.FaceValue,
        Currency=data.Currency,
        Amortization=data.Amortization,
        RedemptionType=data.RedemptionType,
        EmbeddedOptions=data.EmbeddedOptions,
        MinTradableLot=data.MinTradableLot,
        CreditRating=data.CreditRating,
        RatingAgency=data.RatingAgency,
        Seniority=data.Seniority,
        Security=data.Security,
        TaxStatus=data.TaxStatus,
        WithholdingTDS=data.WithholdingTDS,
        CapitalGains=data.CapitalGains,
        RegulatoryTags=data.RegulatoryTags
    )
    db.add(new_bond)
    db.commit()
    return {"message": "Bond created successfully"}

@app.get("/api/bond-master")
def get_bonds(db: Session = Depends(get_db)):
    return db.query(BondMaster).all()

@app.post("/api/bond-master/upload")
async def upload_bond_master(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    try:
        contents = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")
    
    success_count = 0
    errors = []

    for index, row in df.iterrows():
        try:
            def get_val(col):
                return row[col] if col in df.columns and pd.notna(row[col]) else None

            isin = get_val("ISIN")
            if not isin: continue

            existing = db.query(BondMaster).filter(BondMaster.ISIN == isin).first()
            if existing:
                pass
            else:
                existing = BondMaster(ISIN=isin)
            
            existing.BondName = get_val("BondName") or get_val("Security Name")
            existing.IssuerName = get_val("IssuerName") or get_val("Issuer Name")
            # ... map others
            
            if not existing.ID:
                db.add(existing)
            success_count += 1
        except Exception as e:
            errors.append(f"Row {index}: {str(e)}")
    
    db.commit()
    return {"message": f"Processed {success_count} records", "errors": errors}
