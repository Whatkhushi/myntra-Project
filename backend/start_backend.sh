#!/bin/bash

echo "Starting Wardrobe API Backend..."
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed or not in PATH"
    echo "Please install Python 3.8+ and try again"
    exit 1
fi

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "Installing dependencies..."
    pip3 install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "Failed to install dependencies"
        exit 1
    fi
    echo
fi

# Start the Flask server
echo "Starting Flask server on http://localhost:5000"
echo "Press Ctrl+C to stop the server"
echo
python3 run.py
