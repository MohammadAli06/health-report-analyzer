"""
Database Configuration
Using SQLite - no server required!
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Check for DATABASE_URL environment variable
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./medinsight.db")

# Fix for Railway/Heroku: SQLAlchemy 2.0+ requires "postgresql://" not "postgres://"
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Ensure SQLite URLs are handled correctly
if DATABASE_URL and DATABASE_URL.startswith("sqlite"):
    # SQLite needs this for threading and handles absolute paths in volumes
    connect_args = {"check_same_thread": False}
else:
    connect_args = {}

# Create engine
engine = create_engine(DATABASE_URL, connect_args=connect_args)
print(f"✓ Using database: {DATABASE_URL}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables"""
    from models.db_models import Base
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully")
