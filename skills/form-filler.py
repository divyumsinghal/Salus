# /home/daytona/skills/form_filler.py

import sys
from playwright.sync_api import sync_playwright

FORM_TYPE = sys.argv[1] if len(sys.argv) > 1 else "demo"

def fill_demo_form(page):
    # Example: use a safe public test form OR local HTML
    page.goto("https://httpbin.org/forms/post")

    page.fill('input[name="custname"]', "Margaret Byrne")
    page.fill('input[name="custtel"]', "0870000000")
    page.fill('input[name="custemail"]', "maggie@example.com")

    page.select_option('select[name="size"]', "medium")

    # DO NOT submit in demo
    page.screenshot(path="/home/daytona/form_preview.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        if FORM_TYPE == "fuel_allowance":
            fill_demo_form(page)
        else:
            fill_demo_form(page)

        browser.close()

if __name__ == "__main__":
    main()