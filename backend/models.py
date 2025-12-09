from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, DateTime, Date, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 1. Get DATABASE_URL from env
DATABASE_URL = os.getenv("DATABASE_URL")

# 2. If not found, fallback to SQLite
if not DATABASE_URL:
    DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'pms.db')}"

# 3. Fix for Render (postgres:// -> postgresql://)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    UserID = Column(String, primary_key=True, index=True)
    PasswordHash = Column(String)
    Name = Column(String)
    Address = Column(String)
    Email = Column(String, unique=True, index=True)
    Phone = Column(String)
    Role = Column(String) # 'Admin' or 'Investment Manager'
    
    portfolios = relationship("Portfolio", back_populates="owner")

class Portfolio(Base):
    __tablename__ = "portfolios"

    PortfolioID = Column(Integer, primary_key=True, index=True)
    UserID = Column(String, ForeignKey("users.UserID"))
    PortfolioName = Column(String)
    TotalValue = Column(Float, default=0.0)
    CreatedDate = Column(DateTime, default=datetime.utcnow)

    # Client Details
    PortfolioType = Column(String)
    ProductType = Column(String)
    PortfolioLevel = Column(String)
    RiskLevel = Column(String)
    RelationshipManager = Column(String)
    BankName = Column(String)
    BankAccountNo = Column(String)
    IfscCode = Column(String)
    BrokerName = Column(String)
    BrokerAccountNo = Column(String)
    NomineeName = Column(String)
    AllocationPercentage = Column(Float)
    Relationship = Column(String)

    owner = relationship("User", back_populates="portfolios")
    holdings = relationship("Holding", back_populates="portfolio")
    transactions = relationship("Transaction", back_populates="portfolio")

class Asset(Base):
    __tablename__ = "assets"

    AssetID = Column(Integer, primary_key=True, index=True)
    AssetName = Column(String)
    TickerSymbol = Column(String, unique=True, index=True)
    AssetType = Column(String) # Equity, Debt, Mutual Fund
    CurrentPrice = Column(Float)

    holdings = relationship("Holding", back_populates="asset")
    transactions = relationship("Transaction", back_populates="asset")

class Holding(Base):
    __tablename__ = "holdings"

    HoldingID = Column(Integer, primary_key=True, index=True)
    PortfolioID = Column(Integer, ForeignKey("portfolios.PortfolioID"))
    AssetID = Column(Integer, ForeignKey("assets.AssetID"))
    Quantity = Column(Integer)
    PurchasePrice = Column(Float)
    PurchaseDate = Column(DateTime, default=datetime.utcnow)

    portfolio = relationship("Portfolio", back_populates="holdings")
    asset = relationship("Asset", back_populates="holdings")

class Transaction(Base):
    __tablename__ = "transactions"

    TransactionID = Column(Integer, primary_key=True, index=True)
    PortfolioID = Column(Integer, ForeignKey("portfolios.PortfolioID"))
    AssetID = Column(Integer, ForeignKey("assets.AssetID"), nullable=True) # Made nullable as manual transactions might not link immediately
    
    # Core Fields
    TransID = Column(String) # For "Transaction ID" (TXN-NEW...)
    TradeDate = Column(Date, default=datetime.utcnow)
    SettlementDate = Column(Date)
    SecurityName = Column(String)
    ISIN = Column(String)
    Type = Column(String) # Buy, Sell (Transaction Type)
    Exchange = Column(String) # NSE, BSE
    Quantity = Column(Integer)
    Price = Column(Float)
    Amount = Column(Float) # Calculated
    Currency = Column(String, default="INR")
    Broker = Column(String)
    BrokerFees = Column(Float)
    TransactionDate = Column(DateTime, default=datetime.utcnow) # Kept for legacy/audit

    portfolio = relationship("Portfolio", back_populates="transactions")
    asset = relationship("Asset", back_populates="transactions")

class EquityMaster(Base):
    __tablename__ = "equity_masters"

    ID = Column(Integer, primary_key=True, index=True)
    
    # Security Details
    ISIN = Column(String, unique=True, index=True)
    TickerNSE = Column(String)
    TickerBSE = Column(String)
    SecurityName = Column(String)
    IssuerLEI = Column(String)
    Country = Column(String) # Country_of_Issue
    Currency = Column(String) # Currency_of_Trading
    ListingDate = Column(Date)
    Status = Column(String)

    # Instrument Classification
    AssetClass = Column(String)
    SubAssetClass = Column(String)
    Sector = Column(String)
    Industry = Column(String)
    MarketSegment = Column(String)
    Identifiers = Column(String) # BBGID / RIC

    # Trading Details
    PrimaryExchange = Column(String) # Exchange_Primary
    MIC = Column(String)
    FaceValue = Column(Integer) # Added
    LotSize = Column(Integer) # Lot_Size_Cash
    TickSize = Column(String)
    SettlementCycle = Column(String)
    TradingStatus = Column(String)

    # Corporate Actions
    ActionType = Column(String)
    EffectiveDate = Column(Date)
    Details = Column(String) # Corporate_Actions_Recent
    AdjustmentFactor = Column(String)
    Notes = Column(String)

class BondMaster(Base):
    __tablename__ = "bond_masters"

    ID = Column(Integer, primary_key=True, index=True)
    
    # Security Details
    BondName = Column(String)
    ISIN = Column(String, unique=True, index=True)
    Ticker = Column(String)
    BBGID = Column(String)
    SecurityType = Column(String)

    # Issue Details
    IssueDate = Column(Date)
    IssueSize = Column(Integer) # INT as per request
    ModeOfIssue = Column(String)
    OutstandingAmount = Column(Integer) # INT as per request
    MaturityDate = Column(Date)
    ListingStatus = Column(String)
    Exchange = Column(String)
    IssuerName = Column(String)
    IssueType = Column(String)

    # Coupon Details
    CouponRate = Column(Float)
    CouponType = Column(String)
    Frequency = Column(String) # Interest_Payment_frequency
    DayCount = Column(String) # From UI
    NextCouponDate = Column(Date) # From UI
    ResetIndex = Column(String) # From UI

    # Principal Details
    FaceValue = Column(Integer)
    Currency = Column(String)
    Amortization = Column(String) # From UI
    RedemptionType = Column(String) # From UI
    EmbeddedOptions = Column(String) # From UI
    MinTradableLot = Column(Float) # From UI

    # Credit & Risk
    CreditRating = Column(String)
    RatingAgency = Column(String)
    Seniority = Column(String)
    Security = Column(String) # From UI (Secured/Unsecured)

    # Tax Details
    TaxStatus = Column(String)
    WithholdingTDS = Column(String) # From UI
    CapitalGains = Column(String) # From UI
    RegulatoryTags = Column(String) # From UI

def init_db():
    print("Running init_db...")
    Base.metadata.create_all(bind=engine)
    print("init_db complete.")
