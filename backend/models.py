from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, DateTime, Date, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'pms.db')}")

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
    AssetID = Column(Integer, ForeignKey("assets.AssetID"))
    Type = Column(String) # Buy, Sell
    Quantity = Column(Integer)
    Price = Column(Float)
    TransactionDate = Column(DateTime, default=datetime.utcnow)

    portfolio = relationship("Portfolio", back_populates="transactions")
    asset = relationship("Asset", back_populates="transactions")

def init_db():
    Base.metadata.create_all(bind=engine)
