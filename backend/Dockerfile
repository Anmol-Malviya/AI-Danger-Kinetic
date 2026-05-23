# FastAPI Backend Production Dockerfile
FROM python:3.11-slim

# Prevent Python from writing .pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
ENV PYTHONPATH=/app

# Install system dependencies for Tesseract OCR and runtime libraries for OpenCV/ML
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    libglib2.0-0 \
    libgomp1 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory to /app
WORKDIR /app

# Copy requirements first to leverage Docker layer caching
COPY requirements.txt /app/requirements.txt

# Upgrade pip and install Python packages (no-cache to keep image small)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend files (expects build context to be backend directory)
COPY . /app/backend

# Create a non-privileged user and setup directories with correct permissions
RUN adduser --disabled-password --gecos "" appuser && \
    mkdir -p /app/backend/uploads /app/backend/processed && \
    chown -R appuser:appuser /app

# Switch to the non-privileged user for enhanced runtime security
USER appuser

# Expose port
EXPOSE 8000

# Run FastAPI using python module execution
CMD ["python", "-m", "backend.main"]

