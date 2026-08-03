import requests
API_TOKEN = "d04be28fbf5d492389f3b254204bf2791a31836555054e84a17035aa9500ecef"
BASE_URL = "https://api.itick.org"
# US stock AAPL 5-minute K-lines: kType=2 (5-minute; 1=1-minute, 3=15-minute, etc.), limit=10 (last 10 bars)
STOCK_KLINE_URL = f"{BASE_URL}/stock/kline?region=US&code=AAPL&kType=2&limit=10"
headers = {
    "accept": "application/json",
    "token": API_TOKEN
}
try:
    response = requests.get(STOCK_KLINE_URL, headers=headers)
    if response.status_code == 200:
        data = response.json()
        kline_list = data.get("data", ())  # All K-line data stored in a list
        print("="*60)
        print("Recent 10 5-minute K-lines for AAPL (AAPL$US)")
        print("="*60)
        print(f"{'Time':<20}{'Open':<10}{'Close':<10}{'High':<10}{'Low':<10}")
        print("-"*60)
        # Iterate through K-lines and print core information
        for kline in kline_list:
            time_str = str(kline.get('t', 'N/A'))  # Timestamp (can be converted to readable format)
            open_price = kline.get('o', 'N/A')
            close_price = kline.get('c', 'N/A')
            high_price = kline.get('h', 'N/A')
            low_price = kline.get('l', 'N/A')
            print(f"{time_str:<20}{open_price:<10}{close_price:<10}{high_price:<10}{low_price:<10}")
    else:
        print(f"Request failed, status code: {response.status_code}, error: {response.text}")
except Exception as e:
    print(f"Exception during API call: {str(e)}")