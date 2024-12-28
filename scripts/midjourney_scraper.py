import os
import json
import time
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import requests
from typing import Dict, List, Optional
import re

class MidjourneyImageScraper:
    def __init__(self, output_dir: str = "output"):
        self.output_dir = output_dir
        self.images_dir = os.path.join(output_dir, "images")
        self.metadata_file = os.path.join(output_dir, "metadata.json")
        self.metadata: Dict[str, Dict] = {}
        
        # Create output directories if they don't exist
        os.makedirs(self.images_dir, exist_ok=True)
        
        # Load existing metadata if it exists
        if os.path.exists(self.metadata_file):
            with open(self.metadata_file, 'r') as f:
                self.metadata = json.load(f)

        # Initialize undetected-chromedriver
        options = uc.ChromeOptions()
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-gpu')
        self.driver = uc.Chrome(options=options)

    def extract_job_links(self, html_content: str) -> List[str]:
        """Extract job IDs from HTML content."""
        job_links = []
        
        # Look for image URLs in the cdn.midjourney.com format
        try:
            import re
            # This pattern matches both the 0_0.webp and 0_0_384_N.webp formats
            img_pattern = r'cdn\.midjourney\.com/([a-f0-9-]+)/[^"\']+\.webp'
            matches = re.finditer(img_pattern, html_content)
            
            for match in matches:
                job_id = match.group(1)
                if job_id and len(job_id) > 30 and '-' in job_id:
                    job_links.append(f"https://www.midjourney.com/jobs/{job_id}")
            
            print(f"Found {len(job_links)} links from image URLs")
        except Exception as e:
            print(f"Error extracting from images: {e}")
        
        # Also look for direct job links
        try:
            href_pattern = r'href="/jobs/([a-f0-9-]+)(?:\?[^"]*)?\"'
            matches = re.finditer(href_pattern, html_content)
            
            for match in matches:
                job_id = match.group(1)
                if job_id and len(job_id) > 30 and '-' in job_id:
                    job_links.append(f"https://www.midjourney.com/jobs/{job_id}")
            
            print(f"Found {len(job_links)} total links after checking hrefs")
        except Exception as e:
            print(f"Error extracting from hrefs: {e}")
        
        # Remove duplicates while preserving order
        unique_links = list(dict.fromkeys(job_links))
        
        print(f"Found {len(unique_links)} unique job links")
        if unique_links:
            print("\nFirst 3 links:")
            for link in unique_links[:3]:
                print(link)
            print("\nLast 3 links:")
            for link in unique_links[-3:]:
                print(link)
        
        return unique_links

    def fetch_job_data(self, url: str) -> Optional[Dict]:
        """Fetch job data using Selenium."""
        try:
            print(f"\nNavigating to {url}")
            self.driver.get(url)
            time.sleep(3)
            
            # Get the job ID from URL
            job_id = url.split('/')[-1].split('?')[0]
            
            # Get image URL directly from img tag and clean it
            try:
                img_element = self.driver.find_element(By.CSS_SELECTOR, 'img.absolute')
                image_url = img_element.get_attribute('src')
                
                # Clean the URL to get full size version
                # Remove size suffix (e.g., _384_N) and any query parameters
                base_url = image_url.split('?')[0]  # Remove query params
                base_url = re.sub(r'_\d+_[A-Z]\.', '.', base_url)  # Remove size suffix
                image_url = base_url
                
                print(f"Found image URL: {image_url}")
            except Exception as e:
                print(f"Error finding image: {e}")
                return None
            
            # Get prompt from the p tag
            try:
                prompt_element = self.driver.find_element(By.CSS_SELECTOR, 'div.group\\/promptText p')
                prompt = prompt_element.text.strip()
                print(f"Found prompt: {prompt}")
            except Exception as e:
                print(f"Error finding prompt: {e}")
                return None
            
            # Save the image
            file_path = os.path.join(self.images_dir, f"{job_id}.png")
            if not os.path.exists(file_path):
                # Get cookies from current session
                cookies = {c['name']: c['value'] for c in self.driver.get_cookies()}
                
                headers = {
                    'User-Agent': self.driver.execute_script("return navigator.userAgent;"),
                    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': url,
                    'Origin': 'https://www.midjourney.com',
                    'Cookie': '; '.join([f"{k}={v}" for k, v in cookies.items()])
                }
                
                # Try to download the image
                response = requests.get(image_url, headers=headers, cookies=cookies)
                
                if response.status_code == 200:
                    os.makedirs(os.path.dirname(file_path), exist_ok=True)
                    with open(file_path, 'wb') as f:
                        f.write(response.content)
                    print("Successfully saved image")
                else:
                    print(f"Failed to download image: {response.status_code}")
                    return None
            
            return {
                'id': job_id,
                'prompt': prompt,
                'image_url': image_url,
                'url': url
            }
            
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None

    def download_image(self, image_url: str, job_id: str) -> bool:
        """Download an image using requests."""
        file_path = os.path.join(self.images_dir, f"{job_id}.png")
        
        if os.path.exists(file_path):
            return True
            
        try:
            print(f"Downloading image from: {image_url}")
            
            headers = {
                'User-Agent': self.driver.execute_script("return navigator.userAgent;"),
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.midjourney.com/',
                'Origin': 'https://www.midjourney.com'
            }
            
            response = requests.get(image_url, headers=headers)
            
            if response.status_code == 200:
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                with open(file_path, 'wb') as f:
                    f.write(response.content)
                print(f"Successfully downloaded image")
                return True
                
            print(f"Failed to download image: {response.status_code}")
            return False
            
        except Exception as e:
            print(f"Error downloading image: {e}")
            return False

    def process_page(self, html_file: Optional[str] = None):
        """Process either a local HTML file or let user navigate to desired page."""
        try:
            if html_file:
                with open(html_file, 'r', encoding='utf-8') as f:
                    page_source = f.read()
                print(f"Using HTML file: {html_file}")
            else:
                print("Opening browser for manual navigation...")
                self.driver.get("https://www.midjourney.com/auth/signin")
                input("Please:\n1. Log in to Midjourney\n2. Navigate to the page you want to scrape\n3. SCROLL TO THE BOTTOM OF THE PAGE to load all images\n4. Press Enter when ready...")
                print(f"Using current page: {self.driver.current_url}")
                
                # Get page source after manual scrolling
                page_source = self.driver.page_source
                
                # Save the HTML for debugging
                with open('debug_page.html', 'w', encoding='utf-8') as f:
                    f.write(page_source)
                print("Saved page source to debug_page.html")

            # Extract all job IDs using regex
            import re
            job_ids = set()
            
            # Look for IDs in various formats
            patterns = [
                r'cdn\.midjourney\.com/([a-f0-9-]{36})',  # CDN URLs
                r'href="/jobs/([a-f0-9-]{36})',           # Job links
                r'"id":"([a-f0-9-]{36})"',                # JSON data
                r'/jobs/([a-f0-9-]{36})'                  # Any job reference
            ]
            
            for pattern in patterns:
                matches = re.finditer(pattern, page_source)
                for match in matches:
                    job_ids.add(match.group(1))
            
            job_links = [f"https://www.midjourney.com/jobs/{job_id}" for job_id in job_ids]
            print(f"\nFound {len(job_links)} unique job links")
            
            if job_links:
                print("\nFirst 5 links:")
                for link in job_links[:5]:
                    print(link)
                print("\nLast 5 links:")
                for link in job_links[-5:]:
                    print(link)

            # Process each link
            for job_url in job_links:
                job_id = job_url.split('/')[-1]
                if job_id in self.metadata:
                    continue

                print(f"\nProcessing {job_url}")
                job_data = self.fetch_job_data(job_url)
                if not job_data:
                    continue

                if job_data.get('image_url'):
                    success = self.download_image(job_data['image_url'], job_id)
                    if success:
                        self.metadata[job_id] = job_data
                        with open(self.metadata_file, 'w') as f:
                            json.dump(self.metadata, f, indent=2)
                
                time.sleep(1)

        finally:
            input("Press Enter to close the browser...")
            self.driver.quit()

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Extract Midjourney images and metadata')
    parser.add_argument('--html', help='Optional: Path to HTML file containing Midjourney links', default=None)
    parser.add_argument('--output', default='output', help='Output directory for images and metadata')
    args = parser.parse_args()

    scraper = MidjourneyImageScraper(args.output)
    scraper.process_page(args.html)

if __name__ == "__main__":
    main() 