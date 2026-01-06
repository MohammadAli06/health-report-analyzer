"""
Medical Report Analysis Platform - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Import routers
from routers import reports, insights, users

# Initialize database
from database import Base, engine
from models import db_models
Base.metadata.create_all(bind=engine)
print("✓ Database tables initialized")

# Create FastAPI app
app = FastAPI(
    title="Medical Report Analysis API",
    description="AI-powered medical test report interpretation and analysis",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for easier deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(insights.router, prefix="/api/insights", tags=["Insights"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])


@app.get("/")
async def root():
    return {
        "message": "Medical Report Analysis API",
        "version": "1.0.0",
        "status": "healthy"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
