#!/usr/bin/env python3
"""
Simple script to run the Flask backend server
"""
from app import app, create_tables

if __name__ == '__main__':
    print("Starting Wardrobe API Server...")
    print("Server will be available at: http://localhost:5000")
    print("API endpoints:")
    print("  POST /api/wardrobe/upload - Upload wardrobe item")
    print("  GET  /api/wardrobe - Get all wardrobe items")
    print("  DELETE /api/wardrobe/<id> - Delete wardrobe item")
    print("  GET  /api/health - Health check")
    print("\nPress Ctrl+C to stop the server")
    
    create_tables()
    app.run(debug=True, host='0.0.0.0', port=5000)
