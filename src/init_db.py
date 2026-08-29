import pandas as pd
from sqlalchemy import create_engine, text
from config import DATABASE_URL
import os

# 数据文件路径（已改为 te-sa.csv）
CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'te-sa.csv')

def create_table(engine):
    create_sql = """
    CREATE TABLE IF NOT EXISTS sales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sale_date DATE NOT NULL,
        city VARCHAR(50) NOT NULL,
        store_id VARCHAR(20),
        product_name VARCHAR(100) NOT NULL,
        category VARCHAR(50),
        unit_price DECIMAL(10,2),
        quantity INT,
        discount DECIMAL(3,2) DEFAULT 0,
        actual_amount DECIMAL(10,2),
        member_ratio DECIMAL(5,2),
        weather VARCHAR(20),
        season VARCHAR(10),
        is_holiday TINYINT DEFAULT 0,
        campaign VARCHAR(50)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    with engine.connect() as conn:
        conn.execute(text(create_sql))
        conn.commit()
    print("✅ 表创建成功")

def import_csv(engine, csv_path):
    try:
        df = pd.read_csv(csv_path, encoding='utf-8')
        df = df.drop_duplicates().fillna({'discount':0, 'member_ratio':0, 'campaign':'无活动'})
        df.to_sql('sales', engine, if_exists='append', index=False, chunksize=1000)
        print(f"✅ 成功导入 {len(df)} 条记录到 MySQL")
    except FileNotFoundError:
        print(f"❌ 错误：找不到数据文件 {csv_path}")
        print("请确保 data/ 目录下存在 te-sa.csv 文件")

def clear_table(engine):
    with engine.connect() as conn:
        conn.execute(text("TRUNCATE TABLE sales"))
        conn.commit()
    print("🗑️ 已清空 sales 表")

def init_database():
    engine = create_engine(DATABASE_URL)
    create_table(engine)
    choice = input("是否清空已有数据并重新导入？(y/n): ")
    if choice.lower() == 'y':
        clear_table(engine)
        import_csv(engine, CSV_PATH)
    else:
        print("⏭️ 跳过数据导入")

if __name__ == '__main__':
    init_database()
