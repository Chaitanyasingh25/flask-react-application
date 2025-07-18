from flask import Flask, request, jsonify, redirect
from kiteconnect import KiteConnect
from openpyxl import load_workbook
from datetime import datetime
import os
from flask_cors import CORS
from datetime import timedelta

app = Flask(__name__)
CORS(app)

# ========= CONFIG ===============
API_KEY     = "ixick4apw3b5oh22"
API_SECRET  = "whlu97153a2mbhcer97g7mqtkabj3rl3"
TOKEN_FILE  = "access_token.txt"

EXCEL_PATH  = r"C:\Users\Administrator\Desktop\ay2\RW leverage Calac.xlsx"
SHEET_NAME  = "V1- Code"
REDIRECT_URL = "http://localhost:5000/login/callback"

kite = KiteConnect(api_key=API_KEY)
INSTRUMENTS_CACHE = []

# ========== TOKEN HANDLING ==========
def initialize_kite():
    if os.path.exists(TOKEN_FILE):
        try:
            with open(TOKEN_FILE, "r") as f:
                access_token = f.read().strip()
                kite.set_access_token(access_token)
                kite.profile()  # Validate token
                return True
        except:
            return False
    return False

# ========== INSTRUMENT CACHE ==========
def cache_instruments():
    global INSTRUMENTS_CACHE
    try:
        print("📥 Fetching instruments from Kite...")
        instruments = (
            kite.instruments("NSE") +
            kite.instruments("BSE") +
            kite.instruments("MCX")
        )
        INSTRUMENTS_CACHE = instruments
        print(f"✅ Cached {len(instruments)} instruments.")
    except Exception as e:
        print(f"❌ Failed to cache instruments: {e}")

# ========== API ENDPOINTS ==========

@app.route("/login/status", methods=["GET"])
def check_login_status():
    if initialize_kite():
        return jsonify({"status": "logged_in"})
    else:
        return jsonify({"status": "not_logged_in"})

@app.route("/login/url", methods=["GET"])
def get_login_url():
    try:
        login_url = kite.login_url()
        return jsonify({"login_url": login_url})
    except Exception as e:
        return jsonify({"error": "Failed to generate login URL"}), 500

@app.route("/login/callback")
def login_callback():
    request_token = request.args.get("request_token")
    if not request_token:
        return "Error: No request token found", 400
    try:
        session = kite.generate_session(request_token, api_secret=API_SECRET)
        access_token = session["access_token"]
        with open(TOKEN_FILE, "w") as f:
            f.write(access_token)
        kite.set_access_token(access_token)
        cache_instruments()  # Cache on successful login
        return redirect("http://localhost:3000/dashboard")
    except Exception as e:
        return f"Login failed: {e}", 500

@app.route("/search-symbols", methods=["GET"])
def search_symbols():
    if not initialize_kite():
        return jsonify({"error": "Not logged in"}), 401

    query = request.args.get("query", "").strip().lower()
    if not query:
        return jsonify([])

    matches = []
    for instrument in INSTRUMENTS_CACHE:
        symbol = instrument.get("tradingsymbol", "").lower()
        name = instrument.get("name", "").lower()
        if query in symbol or query in name:
            matches.append({
                "tradingsymbol": instrument["tradingsymbol"],
                "exchange": instrument["exchange"],
                "name": instrument.get("name", "")
            })
        if len(matches) >= 20:
            break

    return jsonify(matches)

@app.route("/get-symbol-data", methods=["POST"])
def get_symbol_data():
    if not initialize_kite():
        return jsonify({"error": "Not logged in"}), 401

    data = request.get_json()
    exchange = data.get("exchange", "").strip().upper()
    tradingsymbol = data.get("tradingsymbol", "").strip().upper()
    if not exchange or not tradingsymbol:
        return jsonify({"error": "Exchange and Tradingsymbol required"}), 400

    symbol = f"{exchange}:{tradingsymbol}"

    try:
        price = kite.ltp(symbol)[symbol]['last_price']
    except Exception as e:
        return jsonify({"error": f"Failed to fetch price: {e}"}), 500

    try:
        margin_info = kite.margins([{
            "exchange": exchange,
            "tradingsymbol": tradingsymbol,
            "transaction_type": "BUY",
            "product": "NRML",
            "variety": "regular"
        }])
        margin = margin_info[0]['total']
        return jsonify({"symbol": symbol, "price": price, "margin": margin})
    except Exception as e:
        return jsonify({
            "symbol": symbol,
            "price": price,
            "margin_error": f"Margin fetch failed: {e}"
        }), 200

@app.route("/historical", methods=["POST"])
def get_historical_data():
    if not initialize_kite():
        return jsonify({"error": "Not logged in"}), 401

    data = request.get_json()
    exchange = data.get("exchange", "").strip().upper()
    tradingsymbol = data.get("tradingsymbol", "").strip().upper()
    from_date = data.get("from_date")  # e.g., "2024-01-01"
    to_date = data.get("to_date")      # e.g., "2024-01-10"
    interval = data.get("interval", "day")

    if not all([exchange, tradingsymbol, from_date, to_date]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # ✅ Get all instruments for the exchange
        instruments = kite.instruments(exchange)
        
        # ✅ Find the correct instrument token
        matching = next((i for i in instruments if i["tradingsymbol"] == tradingsymbol), None)
        if not matching:
            return jsonify({"error": f"Symbol {tradingsymbol} not found in {exchange}"}), 404

        token = matching["instrument_token"]

        from_dt = datetime.strptime(from_date, "%Y-%m-%d")
        to_dt = datetime.strptime(to_date, "%Y-%m-%d") + timedelta(days=1)

        # ✅ Call Kite historical API with token
        ohlc_data = kite.historical_data(
            instrument_token=token,
            from_date=from_dt,
            to_date=to_dt,
            interval=interval
        )
        return jsonify(ohlc_data)

    except Exception as e:
        return jsonify({"error": f"Failed to fetch historical data: {e}"}), 500

# ========== MAIN ==========
if __name__ == "__main__":
    if initialize_kite():
        cache_instruments()
    app.run(debug=True)
