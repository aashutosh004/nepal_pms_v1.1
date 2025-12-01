import requests
from bs4 import BeautifulSoup

def test_scraping():
    print("Testing General News Scraping...")
    url = "https://www.sharesansar.com/category/latest"
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        soup = BeautifulSoup(response.content, 'html.parser')
        news_divs = soup.select('div.featured-news-list > div.row')
        print(f"Found {len(news_divs)} news items.")
        
        for i, item in enumerate(news_divs[:3]):
            title_tag = item.select_one('h4.featured-news-title a')
            date_tag = item.select_one('span.text-org')
            if title_tag:
                print(f"Item {i+1}: {title_tag.text.strip()} ({date_tag.text.strip() if date_tag else 'No Date'})")
            else:
                print(f"Item {i+1}: No title found")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_scraping()
