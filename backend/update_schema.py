import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pms.db')

def add_column_if_not_exists(cursor, table, column, definition):
    try:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")
        print(f"Added column {column} to {table}")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print(f"Column {column} already exists in {table}")
        else:
            print(f"Error adding {column} to {table}: {e}")

def update_schema():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    columns_to_add = [
        ("TransID", "VARCHAR"),
        ("TradeDate", "DATE"),
        ("SettlementDate", "DATE"),
        ("SecurityName", "VARCHAR"),
        ("ISIN", "VARCHAR"),
        # Type already exists
        ("Exchange", "VARCHAR"),
        # Quantity already exists
        # Price already exists
        ("Amount", "FLOAT"),
        ("Currency", "VARCHAR"),
        ("Broker", "VARCHAR"),
        ("BrokerFees", "FLOAT")
    ]

    for col_name, col_type in columns_to_add:
        add_column_if_not_exists(cursor, "transactions", col_name, col_type)

    # Also make AssetID nullable if it isn't (SQLite doesn't support altering column nullability easily, 
    # so we'll skip that for now and rely on application logic or recreation if needed, 
    # but for adding columns it's fine).

    conn.commit()
    conn.close()
    print("Schema update complete.")

if __name__ == "__main__":
    update_schema()
