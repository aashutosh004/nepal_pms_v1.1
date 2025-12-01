from playwright.sync_api import sync_playwright
import traceback

def test_playwright():
    print("Starting Playwright Test...")
    try:
        with sync_playwright() as p:
            print("Playwright initialized.")
            print("Launching Chromium...")
            browser = p.chromium.launch(headless=True)
            print("Chromium launched.")
            page = browser.new_page()
            print("Page created.")
            page.goto("https://example.com")
            print("Navigated to example.com")
            title = page.title()
            print(f"Page Title: {title}")
            browser.close()
            print("Browser closed.")
    except Exception:
        print("An error occurred:")
        traceback.print_exc()

if __name__ == "__main__":
    test_playwright()
