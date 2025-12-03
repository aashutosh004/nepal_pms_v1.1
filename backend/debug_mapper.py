import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.models import Base, EquityMaster, engine

def test():
    print("Creating tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("Success")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test()
