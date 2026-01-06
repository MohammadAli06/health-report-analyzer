# Use Python 3.11 Bullseye (more stable for system packages)
FROM python:3.11-bullseye

# Install system dependencies for OCR and PDF processing
RUN apt-get update --fix-missing && apt-get install -y \
    tesseract-ocr \
    poppler-utils \
    libgl1 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app
COPY . .

# Expose the port FastAPI runs on
EXPOSE 8000

# Set Python path to find modules in /app/app
ENV PYTHONPATH=/app/app

# Start the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
