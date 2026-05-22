# FastAPI Backend Production Dockerfile
FROM python:3.10-slim

# Prevent Python from writing .pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Install system dependencies for OpenCV, Tesseract OCR, and building extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    build-essential \
    tesseract-ocr \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory to /app (project root)
WORKDIR /app

# Copy requirements first to leverage Docker layer caching
COPY requirements.txt /app/requirements.txt

# Upgrade pip and install requirements
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend files (expects build context to be backend directory)
COPY . /app/backend

# Set PYTHONPATH so package-style imports function correctly
ENV PYTHONPATH=/app

# Expose port
EXPOSE 8000

# Run FastAPI using python module execution
CMD ["python", "-m", "backend.main"]
