from typing import Optional, List, Dict
from playwright.sync_api import sync_playwright
import traceback

def scrape_news_sync(symbol: Optional[str]) -> List[Dict]:
    news_items = []
    
    # Mock Data Generator
    def get_mock_data(sym):
        return [
            {"title": f"Market Analysis: {sym or 'General'} Trend Positive", "date": "2025-11-26", "link": "#", "source": "System Mock"},
            {"title": f"{sym or 'Market'} Shows Strong Growth Signals", "date": "2025-11-25", "link": "#", "source": "System Mock"},
            {"title": f"Quarterly Report: {sym or 'Economy'} Outlook", "date": "2025-11-24", "link": "#", "source": "System Mock"},
            {"title": f"Investor Update: {sym or 'Market'} Movements", "date": "2025-11-23", "link": "#", "source": "System Mock"},
            {"title": f"Regulatory Changes Affecting {sym or 'Sector'}", "date": "2025-11-22", "link": "#", "source": "System Mock"},
        ]

    if not news_items:
        print("No items found, returning mock data.")
        return get_mock_data(symbol)
        
    return news_items
