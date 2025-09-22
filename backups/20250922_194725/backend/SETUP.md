# Wardrobe API Backend Setup Guide

This guide will help you set up and run the Flask backend for your Closet Twin Style application.

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

## Quick Start

### Option 1: Using the startup script (Recommended)

**Windows:**
```bash
# Double-click start_backend.bat or run in Command Prompt
start_backend.bat
```

**Linux/Mac:**
```bash
# Make executable and run
chmod +x start_backend.sh
./start_backend.sh
```

### Option 2: Manual setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the server:**
   ```bash
   python run.py
   ```

## What happens when you start the backend:

1. ✅ Dependencies are automatically installed
2. ✅ SQLite database is created (`wardrobe.db`)
3. ✅ Upload directory is created (`uploads/`)
4. ✅ Flask server starts on `http://localhost:5000`
5. ✅ CORS is configured for React frontend

## API Endpoints

Once running, your backend provides these endpoints:

- **POST** `/api/wardrobe/upload` - Upload wardrobe items
- **GET** `/api/wardrobe` - Get all wardrobe items  
- **DELETE** `/api/wardrobe/<id>` - Delete specific item
- **GET** `/api/health` - Health check

## Testing the Backend

1. **Health Check:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Upload Test:**
   ```bash
   python test_api.py
   ```

## Frontend Integration

Your React frontend is already configured to work with this backend:

- Upload items will be saved to the database
- Images are stored in the `uploads/` folder
- Frontend displays items from the backend
- CORS is enabled for seamless integration

## File Structure

```
backend/
├── app.py              # Main Flask application
├── run.py              # Server startup script
├── requirements.txt    # Python dependencies
├── test_api.py         # API testing script
├── start_backend.bat   # Windows startup script
├── start_backend.sh    # Linux/Mac startup script
├── uploads/            # Image storage (created automatically)
├── wardrobe.db         # SQLite database (created automatically)
└── README.md           # Documentation
```

## Troubleshooting

### Port 5000 already in use
If you get a "port already in use" error:
1. Stop any other Flask servers
2. Or change the port in `run.py` (line 15)

### Permission errors on uploads
Make sure the backend directory is writable:
```bash
chmod 755 uploads/
```

### CORS errors in frontend
Ensure the backend is running on `http://localhost:5000` and your React app is on `http://localhost:3000` or `http://localhost:5173`.

## Next Steps

1. Start the backend server
2. Start your React frontend (`npm run dev`)
3. Upload items through the frontend
4. Check the database and uploads folder to see your items

Your wardrobe items are now permanently stored and ready for AI outfit recommendations!
