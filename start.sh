#!/bin/bash

# LearnSync Startup Script

echo "🚀 Starting LearnSync..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/upgrade dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "✏️  Please edit .env with your configuration before running the server."
    exit 1
fi

# Run the application
echo "🎯 Starting FastAPI server..."
python main.py
