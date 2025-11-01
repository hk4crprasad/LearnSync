# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install uv

# Copy application code
COPY . .
RUN uv sync
# Copy environment file
COPY .env .env

# Expose port 6765
EXPOSE 6765

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:6765/health')" || exit 1

# Run the application
CMD ["uv","run","main.py"]
