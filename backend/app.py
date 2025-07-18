from flask import Flask, request, jsonify
from kiteconnect import KiteConnect
from openpyxl import load_workbook
from datetime import datetime
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ========= CONFIG ===============
API_KEY     = "ixick4apw3b5oh22"
API_SECRET  = "whlu97153a2mbhcer97g7mqtkabj3rl3"
TOKEN_FILE  = "access_token.txt"

# Provide full path to the Excel file, opened locally in MS Excel
EXCEL_PATH  = r"C:\Users\Administrator\Desktop\ay2\RW leverage Calac.xlsx"
SHEET_NAME  = "V1- Code"
# =================================

# Map symbol to row number in Excel
SYMBOL_ROW_MAP = {
    "MCX:GOLDM25OCTFUT": 12,
    "NSE:SGBFEB32IV-GB": 11,
}

kite = KiteConnect(api_key=API_KEY)

# ========== TOKEN HANDLING ==========
def initialize_kite():
    if os.path.exists(TOKEN_FILE):
        try:
            with open(TOKEN_FILE, "r") as f:
                access_token = f.read().strip()
                kite.set_access_token(access_token)
                kite.profile()
                return True
        except:
            return False
    return False

# ========== API ENDPOINTS ==========

# Check login status
@app.route("/login/status", methods=["GET"])
def check_login_status():
    if initialize_kite():
        return jsonify({"status": "logged_in"})
    else:
        return jsonify({"status": "not_logged_in"})

# Get login URL
@app.route("/login/url", methods=["GET"])
def get_login_url():
    return jsonify({"login_url": kite.login_url()})

# Complete login with request_token
@app.route("/login", methods=["POST"])
def do_login():
    data = request.get_json()
    request_token = data.get("request_token")

    if not request_token:
        return jsonify({"error": "request_token required"}), 400

    try:
        session = kite.generate_session(request_token, api_secret=API_SECRET)
        access_token = session["access_token"]
        with open(TOKEN_FILE, "w") as f:
            f.write(access_token)
        kite.set_access_token(access_token)
        return jsonify({"message": "Login successful"})
    except Exception as e:
        return jsonify({"error": str(e)}), 401

# Update Excel with live price & lot
@app.route("/update", methods=["POST"])
def update_excel():
    if not initialize_kite():
        return jsonify({"error": "Not logged in. Please authenticate."}), 401

    data = request.get_json()
    symbol = data.get("symbol", "").strip().upper()
    lot = float(data.get("lot", 1))

    if symbol not in SYMBOL_ROW_MAP:
        return jsonify({"error": f"Symbol {symbol} not in SYMBOL_ROW_MAP"}), 400

    try:
        # Get live price
        price = kite.ltp(symbol)[symbol]['last_price']
    except Exception as e:
        return jsonify({"error": f"Failed to fetch price: {e}"}), 500

    try:
        # Open and update the Excel file (even if opened in MS Excel)
        wb = load_workbook(EXCEL_PATH)
        sheet = wb[SHEET_NAME]
        row = SYMBOL_ROW_MAP[symbol]

        sheet[f"G{row}"] = price               # Live price
        sheet[f"E{row}"] = lot                 # Lot
        sheet[f"D{row}"] = price * lot         # Total = Price × Lot

        wb.save(EXCEL_PATH)

        return jsonify({
            "message": f"Excel updated for {symbol}",
            "price": price,
            "lot": lot,
            "total": price * lot,
            "row": row
        })

    except Exception as e:
        return jsonify({"error": f"Failed to write to Excel: {e}"}), 500

# ========== MAIN ==========

if __name__ == "__main__":
    app.run(debug=True)
