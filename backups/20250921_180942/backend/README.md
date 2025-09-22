# Wardrobe API Backend

A Flask backend API for the Closet Twin Style application that handles wardrobe item uploads and storage.

## Features

- Upload wardrobe items with images and categories
- Store items in SQLite database
- Retrieve all wardrobe items
- Delete wardrobe items
- CORS support for React frontend
- Comprehensive error handling
- File validation and security

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python run.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Upload Wardrobe Item
- **POST** `/api/wardrobe/upload`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `image`: Image file (png, jpg, jpeg, gif, webp)
  - `category`: String (dresses, accessories, tops, bottoms, shoes)
- **Response**: JSON with item details

### Get All Wardrobe Items
- **GET** `/api/wardrobe`
- **Response**: JSON array of all wardrobe items

### Delete Wardrobe Item
- **DELETE** `/api/wardrobe/<id>`
- **Response**: JSON confirmation message

### Health Check
- **GET** `/api/health`
- **Response**: JSON with server status

## Database Schema

The `wardrobe_items` table contains:
- `id`: Primary key (auto-increment)
- `image_url`: Path to uploaded image
- `category`: Item category
- `created_at`: Timestamp

## File Storage

Uploaded images are stored in the `uploads/` directory with unique filenames to prevent conflicts.

## Error Handling

The API includes comprehensive error handling for:
- Invalid file types
- Missing required fields
- Database errors
- File upload failures
- Large file sizes (16MB limit)
