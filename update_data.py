import os
import requests
import json
from bs4 import BeautifulSoup
from urllib.parse import urljoin

def download_and_optimize():
    base_url = "https://ods.railway.gov.tw"
    list_url = "https://ods.railway.gov.tw/tra-ods-web/ods/download/dataResource/railway_schedule/JSON/list/"
    save_dir = "data"

    if not os.path.exists(save_dir):
        os.makedirs(save_dir)
    print("Fetching new data...")
    x = 0
    try:
        response = requests.get(list_url, timeout=30)
        soup = BeautifulSoup(response.text, 'html.parser')
        links = soup.find_all('a')

        for link in links:
            file_name = link.text.strip()
            if file_name.endswith('.json'):
                download_url = urljoin(base_url, link.get('href'))
                file_res = requests.get(download_url, timeout=30)
                if file_res.status_code == 200:
                    try:
                        data = file_res.json()
                        file_path = os.path.join(save_dir, file_name)
                        with open(file_path, 'w', encoding='utf-8') as f:
                            json.dump(data, f, separators=(',', ':'), ensure_ascii=False)
                        print(file_name)
                        x += 1
                    except Exception as je:
                        print(f"Failed to process {file_name}: {je}")
        
        print(f"-> Downloaded {x} items.")
        print("-------------")
        print("Writing into 'data/index.json'...")

        all_files = sorted(os.listdir(save_dir))
        if "index.json" in all_files:
            all_files.remove("index.json")

        print(f"{len(all_files)} files in total.")
        index_path = os.path.join(save_dir, "index.json")
        with open(index_path, "w", encoding="utf-8") as f:
            json.dump([s[:-5] for s in all_files], f, ensure_ascii=False, indent=4)

        print("Saved index.json")

    except Exception as e:
        print(e)
        exit(1)

if __name__ == "__main__":
    download_and_optimize()