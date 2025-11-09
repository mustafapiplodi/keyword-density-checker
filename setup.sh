#!/bin/bash

# Keyword Density Checker - Setup Script
# This script sets up the development environment

echo "================================"
echo "Keyword Density Checker Setup"
echo "================================"
echo ""

# Check Python version
echo "Checking Python version..."
python3 --version

# Create virtual environment
echo ""
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo ""
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Download spaCy model
echo ""
echo "Downloading spaCy English model..."
python -m spacy download en_core_web_sm

echo ""
echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "To start the application:"
echo "  1. Activate virtual environment: source venv/bin/activate"
echo "  2. Run the server: python app.py"
echo "  3. Open browser to: http://localhost:5000"
echo ""
