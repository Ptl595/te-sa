from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from sqlalchemy import create_engine, text
from config import DATABASE_URL

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)
engine = create_engine(DATABASE_URL)

def query_db(sql, params=None):
    with engine.connect() as conn:
        result = conn.execute(text(sql), params or {})
        return [dict(zip(result.keys(), row)) for row in result]

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/api/summary')
def summary():
    sql = "SELECT SUM(quantity) as total_sales, SUM(actual_amount) as total_revenue, COUNT(*) as total_records, AVG(member_ratio) as avg_member_ratio FROM sales"
    return jsonify(query_db(sql)[0])

@app.route('/api/monthly')
def monthly():
    sql = "SELECT DATE_FORMAT(sale_date, '%Y-%m') as month, SUM(quantity) as total_sales, SUM(actual_amount) as total_revenue FROM sales GROUP BY month ORDER BY month"
    return jsonify(query_db(sql))

@app.route('/api/product_rank')
def product_rank():
    sql = "SELECT product_name, SUM(quantity) as total_sales, SUM(actual_amount) as total_revenue FROM sales GROUP BY product_name ORDER BY total_sales DESC"
    return jsonify(query_db(sql))

@app.route('/api/city_rank')
def city_rank():
    sql = "SELECT city, SUM(quantity) as total_sales, SUM(actual_amount) as total_revenue FROM sales GROUP BY city ORDER BY total_sales DESC"
    return jsonify(query_db(sql))

@app.route('/api/season')
def season():
    sql = "SELECT season, SUM(quantity) as total_sales, SUM(actual_amount) as total_revenue FROM sales GROUP BY season ORDER BY FIELD(season, '春季','夏季','秋季','冬季')"
    return jsonify(query_db(sql))

@app.route('/api/category_pie')
def category_pie():
    sql = "SELECT category, SUM(quantity) as total_sales FROM sales GROUP BY category ORDER BY total_sales DESC"
    return jsonify(query_db(sql))

@app.route('/api/city_product')
def city_product():
    sql = "SELECT city, product_name, SUM(quantity) as total_sales FROM sales GROUP BY city, product_name"
    data = query_db(sql)
    cities = sorted(set(d['city'] for d in data))
    products = sorted(set(d['product_name'] for d in data))
    matrix = [[next((d['total_sales'] for d in data if d['city']==c and d['product_name']==p), 0) for p in products] for c in cities]
    return jsonify({'cities': cities, 'products': products, 'matrix': matrix})

@app.route('/api/holiday')
def holiday():
    sql = "SELECT CASE WHEN is_holiday=1 THEN '节假日' ELSE '非节假日' END as type, AVG(quantity) as avg_sales, SUM(quantity) as total_sales, SUM(actual_amount) as total_revenue FROM sales GROUP BY is_holiday"
    return jsonify(query_db(sql))

@app.route('/api/campaign')
def campaign():
    sql = "SELECT campaign, SUM(quantity) as total_sales, SUM(actual_amount) as total_revenue, AVG(quantity) as avg_sales FROM sales GROUP BY campaign ORDER BY total_sales DESC"
    return jsonify(query_db(sql))

@app.route('/api/weather')
def weather():
    sql = "SELECT weather, SUM(quantity) as total_sales, AVG(quantity) as avg_sales FROM sales GROUP BY weather ORDER BY total_sales DESC"
    return jsonify(query_db(sql))

@app.route('/api/discount')
def discount():
    sql = "SELECT discount, AVG(quantity) as avg_sales, COUNT(*) as order_count FROM sales GROUP BY discount ORDER BY discount"
    return jsonify(query_db(sql))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
