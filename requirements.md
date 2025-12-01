Requirement Background:

NIMB Nepal intends to replace its existing Portfolio Management System (PMS) with a more robust and dynamic solution. The new PMS must be capable of efficiently handling high volumes of daily transactions while offering extensive configurability to seamlessly integrate within the complex Wealth Management architecture of the investment management firm. Additionally, the system should provide flexible and extendable features to adapt to evolving regulatory norms and compliance requirements set by local authorities, ensuring long-term scalability and operational resilience.



(Have the system architecture image)





Sequence Steps:

User initiates file upload

The user starts the process through the Web UI.

Upload file to SFTP File Upload

The file (portfolio or market data) is securely transferred via SFTP.

SFTP File Upload processes the file

Validates and parses the uploaded file.

Portfolio Service receives processed data

Updates portfolio positions and transactions.

Portfolio Service saves data to Database

Stores portfolio records in the central database.

User performs Manual Update

Direct adjustments or corrections are entered manually.

Manual Update sends changes to Portfolio Service

Updates are applied to portfolio records.

Portfolio Service triggers Analytics Engine

Analytics Engine calculates valuations, performance metrics, and other analytics.

Analytics Engine fetches market data from Database

Retrieves necessary data for calculations.

Analytics Engine returns calculated metrics to Portfolio Service

Results are sent back for reporting and further processing.

Portfolio Service sends compliance data to Regulatory Reporting

Generates and transmits reports for regulatory compliance.



Key Tables for PMS:

A Portfolio Management System (PMS) typically requires a well-structured database to handle investments, transactions, analytics, and user data. Key tables to be built in DB.

1. Users

Columns:

UserID (Primary Key)

Name

Email

Role (Investment Manager, Admin)

CreatedDate

2. Portfolio

Columns:

PortfolioID (Primary Key)

UserID (Foreign Key)

PortfolioName

TotalValue

CreatedDate

3. Assets

Columns:

AssetID (Primary Key)

AssetName

TickerSymbol

AssetType (Equity, Debt, Mutual Fund, etc.)

CurrentPrice

4. Holdings

Columns:

HoldingID (Primary Key)

PortfolioID (Foreign Key)

AssetID (Foreign Key)

Quantity

PurchasePrice

PurchaseDate

5. Transactions

Columns:

TransactionID (Primary Key)

PortfolioID

AssetID

Type (Buy/Sell)

Quantity

Price

TransactionDate

6. Market Data

Columns:

AssetID

Date

Price

Quantity



6. Currency Set Up

Columns:

CurrencyCode

ISO 4217 code (e.g., USD, EUR, INR).

Type: VARCHAR(3).

CurrencyName

Full name of the currency (e.g., US Dollar, Euro).

Type: VARCHAR(50).

Symbol

Currency symbol (e.g., $, €, ₹).

Type: VARCHAR(5).

Country

Country associated with the currency (e.g., United States, India).

Type: VARCHAR(50).

DecimalPlaces

Number of decimal places for pricing (e.g., 2 for USD, 0 for JPY).

Type: INT.

IsActive

Flag to indicate if the currency is active in the system.

Type: BOOLEAN.

CreatedDate / UpdatedDate

Audit columns for tracking changes.

Type: DATETIME.

7. Calander (Note: Should likely be "Calendar")

Columns:

CalendarDate

The actual date (e.g., 2025-11-19).

Type: DATE.

DayOfWeek

Name of the day (e.g., Monday, Tuesday).

Type: VARCHAR(10).

DayNumberOfWeek

Numeric representation (e.g., 1 for Monday, 7 for Sunday).

Type: INT.

WeekNumber

Week number in the year (e.g., 46).

Type: INT.

Month

Month name (e.g., November).

Type: VARCHAR(15).

MonthNumber

Numeric month (e.g., 11).

Type: INT.

Quarter

Quarter of the year (e.g., Q4).

Type: VARCHAR(2).

Year

Year (e.g., 2025).

Type: INT.

IsWeekend

Flag indicating if the date is a weekend.

Type: BOOLEAN.

IsHoliday

Flag for market holiday or non-trading day.

Type: BOOLEAN.

HolidayDescription (Optional)

Name of the holiday (e.g., Diwali, Christmas).

Type: VARCHAR(50).

IsTradingDay

Indicates if the market is open for trading.

Type: BOOLEAN.

CreatedDate / UpdatedDate

Audit columns for tracking changes.

Type: DATETIME.







The PMS Interactive Screens:

1. Dashboard

Header: Logo, User Profile, Notifications, Settings

Main KPIs:

Total Portfolio Value

Daily/Monthly Gain/Loss

Asset Allocation Pie Chart

Quick Actions: Add Investment, Withdraw, View Reports/ Download Reports (.xls/.csv)

Recent Activity: Latest transactions, dividends, rebalancing actions



(Have ui for this)



1.a Portfolio Rebalancing – The Logic

Assess Allocation

Equity % = Equity / (Equity + Debt)

Debt % = Debt / (Equity + Debt)

If Equity % > 50 -> BREACH (sell amount = Equity – 50% of total).

If Debt % > 50 -> BREACH (sell amount = Debt – 50% of total).

Proposal generation

Moves the surplus from overweight to underweight (e.g., if Equity > 50%, propose Sell Equity and Buy Debt by the same ₹ amount).

Manual Rebalance

Applies your proposed sells/buys to the input values and reassesses.

Export CSV

Creates a simple 3-column CSV: Action, Asset, Amount.



(Have ui for this, portfolio rebalancing one is different and manual rebalancing ui is different(after clicking on manual rebalancing button a new page opens)



2. Portfolio Overview

Filters: By Asset Class (Equity, Debt, Mutual Funds, etc.), Date Range

Table View:

Asset Name

Quantity

Current Price

Market Value

% Allocation

Gain/Loss

Graph: Performance trend over time



(Have ui for this)



2.a Client Details: The Client details Page will be a sub-node to the Portfolio which will contain the Client specific details which will be tagged to a portfolio or portfolios as the case may (one to one or one to Many). The client details page will be auto created with the manual creation of the Portfolio by entering the basic client details (refer to portfolio details screen of the excel tab for Use cases) or with the file upload for portfolio creation.





(Have ui for this)







3. Asset Details Page

Header: Asset Name, Ticker, Current Price

Tabs:

Overview (Price history chart, fundamentals)

Transactions (Buy/Sell history)

Analytics (Risk metrics, volatility, beta)

News & Updates





(Have ui for this)





4. Transactions

Form: Buy/Sell, Date, Quantity, Price

History Table: sortable by data, type, amount





(Have ui for this)





5. Reports & Analytics

Performance Report: ROI, CAGR, XIRR

Risk Analysis: VaR, Sharpe Ratio

Download Options: PDF, Excel



(Have ui for this)





6. Reconciliation

There will be a provision for a three-way reconciliation in the PMS application at END of each day to run the recon between a) The Investment Manager consolidated file for the day b) Custodian EOD file received by the Bank c) Clearing house EOD file.

This recon tool will also have the ability to do auto recs based on the auto trigger tasks/job set at the EOD for working day (or as decided by the bank).

This recon toll will have the below specifications –

Layout

Left sidebar for navigation (Dashboard / Reconciliation / Reports / Settings)

Top bar with the page title and a "Trigger Recon" button

Main content sections arranged in cards

Upload section (3 panels)

Investment Manager

Custodian

Clearing House

Each panel has:

File input (accepts .csv / .txt)

Delimiter selector (Comma, Pipe, Tab)

Trigger & progress

Trigger Reconciliation button (top + in upload card)

Status text ("Running... / Completed")

Progress bar

Summary KPIs

Total Records

Matched

Missing / Orphans

Amount Mismatches

Breaks Dashboard

Filters: TradeID + Type (Missing/Mismatch)

Export Breaks CSV button

Table showing TradeID, IM/Custodian/Clearing amounts, Type, Difference

Placeholder area for charts/trends (ready for future visuals)

Activity Log

Time-stamped log entries of actions performed



(Have ui for this)









7. Settings

Profile Management

Notification Preferences

Integration (Brokerage APIs, Bank Accounts)



(Have ui for this)