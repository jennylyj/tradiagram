# 自動更新時刻表工具

這個資料夾包含用於自動從 TDX 平台下載並轉換台鐵時刻表的 Python 腳本。

## 檔案說明

- `auto_update.py`: 主程式，負責下載、轉換並儲存 JSON 檔案。
- `apilist.txt`: (可選) 紀錄 API 相關資訊。
- `.env`: (需自行建立) 存放 TDX API 金鑰。

## 安裝與設定

1. **建立虛擬環境 (建議)**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. **安裝依賴套件**
   ```bash
   pip install requests python-dotenv
   ```

3. **設定 API 金鑰**
   在 `tradiagram` 根目錄下建立 `.env` 檔案，並填入您的 TDX Client ID 與 Secret：
   ```ini
   TDX_CLIENT_ID=your_client_id_here
   TDX_CLIENT_SECRET=your_client_secret_here
   ```

## 使用方式

### 手動執行
在專案根目錄執行：
```bash
python automation/auto_update.py
```
程式會自動檢查 `data/` 資料夾，下載尚未存在的日期資料。

### 自動排程 (Crontab)
若要每天自動執行，可設定 crontab：
```bash
0 3 * * * cd /path/to/tradiagram && /path/to/tradiagram/.venv/bin/python automation/auto_update.py >> /tmp/tradiagram_update.log 2>&1
```
(請將路徑替換為您的實際路徑)

## 資料格式
產出的 JSON 檔案格式與專案舊有格式 (`20250901.json`) 相容，包含 `TrainInfos` 列表。
欄位對應：
- `TrainTypeCode` -> `Type`
- `TripLine` -> `Line`
- `TrainTypeID` -> `CarClass`
- `Note` -> `Note` (已處理多語系物件轉字串)
