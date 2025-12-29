import os
import requests
import json
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from datetime import date, timedelta, datetime

def download_and_optimize():
    base_url = "https://ods.railway.gov.tw"
    list_url = "https://ods.railway.gov.tw/tra-ods-web/ods/download/dataResource/railway_schedule/JSON/list/"
    save_dir = "data"
    retention_days = 60 # 設定只保留最近 60 天的檔案

    if not os.path.exists(save_dir):
        os.makedirs(save_dir)

    # 1. 下載並壓縮
    print("Fetching new data...")
    print("Downloaded:")
    x = 0
    try:
        response = requests.get(list_url, timeout=30)
        soup = BeautifulSoup(response.text, 'html.parser')
        links = soup.find_all('a')

        for link in links:
            file_name = link.text.strip()
            if file_name.endswith('.json'):
                download_url = urljoin(base_url, link.get('href'))
                
                # 取得檔案內容
                file_res = requests.get(download_url, timeout=30)
                if file_res.status_code == 200:
                    try:
                        # --- 壓縮關鍵步驟 ---
                        data = file_res.json() # 解析 JSON
                        file_path = os.path.join(save_dir, file_name)
                        with open(file_path, 'w', encoding='utf-8') as f:
                            # separators=(',', ':') 會移除所有的空白與換行
                            json.dump(data, f, separators=(',', ':'), ensure_ascii=False)
                        print(file_name)
                        x += 1
                    except Exception as je:
                        print(f"Failed to process {file_name}: {je}")
        
        print(f"-> Downloaded {x} items.")

# 2. 清理過期檔案
        print("-------------")
        now = date.today()
        threshold_date = now - timedelta(days=retention_days)
        print(f"Cleaning up old files... (Threshold: {threshold_date})")

        deleted_files, kept_files = [], []
        all_files = os.listdir(save_dir)

        for filename in all_files:
            if filename == "index.json":
                continue
            if filename.endswith(".json"):
                try:
                    file_date_str = filename[:8]
                    file_date = datetime.strptime(file_date_str, "%Y%m%d").date()
                    
                    if file_date < threshold_date:
                        os.remove(os.path.join(save_dir, filename))
                        # print(f"D {filename}")
                        deleted_files.append(filename)
                    else:
                        # print(f"- {filename}")
                        kept_files.append(file_date_str)
                except Exception as e:
                    print(f"Skipped {filename}: unknown date({e})")

        deleted_files.sort()
        kept_files.sort()
        print(f"Removed: ")
        print(*deleted_files, sep='\n')
        # i think we can just read index.json
        # print("Remaining files: ")
        # print(*kept_files, sep='\n')
        print(f"-> Deleted {len(deleted_files)} items.")
        print("-------------")
        print(f"{len(kept_files)} files in total.")
        
        index_path = os.path.join(save_dir, "index.json")
        with open(index_path, "w", encoding="utf-8") as f:
            json.dump(kept_files, f, ensure_ascii=False, indent=4)

        print("Saved index.json")

    except Exception as e:
        print(e)
        exit(1)

if __name__ == "__main__":
    download_and_optimize()
