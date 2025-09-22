# Recommendation System Integration

This document describes how the recommendation system is integrated with the backend and frontend.

## Overview

The integration allows users to upload images through the frontend, which are automatically processed by the recommendation system (classification, embedding generation) and immediately appear in the wardrobe UI.

## Architecture

```
Frontend Upload → Backend API → CLI Processor → Recommendation System → Database
```

## Key Components

### 1. CLI Processor (`add_item_cli.py`)

**Usage:**
```bash
python add_item_cli.py --file /path/to/image --main_category tops --source wardrobe
```

**What it does:**
- Copies image to `data/raw/images/`
- Runs classification pipeline (extracts metadata except main category)
- Generates CLIP embedding
- Updates `data/processed/style.csv`
- Updates enhanced datasets
- Updates embeddings
- Returns JSON metadata on stdout

**Output format:**
```json
{
  "status": "ok",
  "metadata": {
    "id": "user_20250921_175000_abc123",
    "filename": "/path/to/image",
    "category": "tops",
    "subcategory": "t_shirt",
    "source": "wardrobe",
    "created_at": "2025-09-21T17:50:00",
    "embedding_generated": true,
    "classification": { ... }
  }
}
```

### 2. Sync Script (`sync_stylecsv_to_db.py`)

**Usage:**
```bash
python sync_stylecsv_to_db.py
```

**What it does:**
- Reads `data/processed/style.csv`
- Filters for wardrobe items (source: wardrobe, custom_wardrobe, user_wardrobe)
- Upserts into backend SQL database
- Adds new columns if needed (subcategory, style_tags, etc.)

### 3. Backend Integration

**Modified upload handler (`/api/wardrobe/upload`):**
- Saves uploaded file
- Calls CLI processor as subprocess
- Parses JSON response
- Stores metadata in database
- Returns enhanced item data

**Database schema extended:**
- `subcategory` - Item subcategory from classification
- `style_tags` - JSON array of style tags
- `dominant_color_hex` - Dominant color hex code
- `emb_index` - Embedding index
- `recommendation_id` - Unique ID from recommendation system

## Data Flow

### Upload Flow
1. User uploads image via frontend
2. Frontend sends POST to `/api/wardrobe/upload`
3. Backend saves image file
4. Backend calls CLI processor:
   ```bash
   python3 add_item_cli.py --file /path/to/image --main_category tops --source wardrobe
   ```
5. CLI processes image (classify, embed, update datasets)
6. CLI returns JSON metadata
7. Backend stores metadata in database
8. Backend returns enhanced item data to frontend
9. Frontend displays new item immediately

### Initial Sync
1. Run sync script to populate database with existing wardrobe items
2. Frontend displays all items from database

## File Structure

```
backend/
├── app.py                          # Modified upload handler
├── instance/wardrobe.db            # SQLite database with extended schema
├── recommendation_system/
│   ├── add_item_cli.py            # CLI processor
│   ├── sync_stylecsv_to_db.py     # Sync script
│   ├── data/
│   │   ├── raw/images/            # User uploaded images
│   │   ├── processed/
│   │   │   ├── style.csv          # Master dataset
│   │   │   ├── enhanced_wardrobe.parquet
│   │   │   └── embeddings/        # CLIP embeddings
│   └── src/                       # ML components
└── test_integration.py            # Integration tests
```

## Setup Instructions

### 1. Initial Setup
```bash
# Sync existing wardrobe items to database
cd backend/recommendation_system
python sync_stylecsv_to_db.py

# Verify items in database
sqlite3 ../instance/wardrobe.db "SELECT COUNT(*) FROM wardrobe_item;"
```

### 2. Start Backend
```bash
cd backend
python app.py
```

### 3. Test Integration
```bash
cd backend
python test_integration.py
```

## Testing

### Manual Testing
1. Start backend server
2. Open frontend upload page
3. Upload an image and select category
4. Verify item appears in wardrobe with enhanced metadata
5. Check database for new record

### Automated Testing
```bash
cd backend
python test_integration.py
```

Tests:
- CLI processor functionality
- Backend health
- Upload integration
- Database updates
- Frontend display

## Error Handling

- **CLI failures**: Backend continues with basic upload (no recommendation data)
- **Database errors**: Transaction rollback, error returned to frontend
- **File errors**: Proper cleanup, informative error messages
- **Logging**: All operations logged for debugging

## Troubleshooting

### Common Issues

1. **CLI not found**: Check path in upload handler
2. **Import errors**: Ensure recommendation system dependencies installed
3. **Database errors**: Check schema, run sync script
4. **File permissions**: Ensure write access to data directories

### Debug Mode
```bash
# Enable Flask debug mode
export FLASK_DEBUG=1
python app.py
```

### Logs
- Backend logs: Console output
- CLI logs: stderr output
- Database: SQLite logs

## Maintenance

### Regular Tasks
- Monitor database size
- Clean up old test images
- Update embeddings as needed
- Backup database regularly

### Adding New Features
- Extend CLI processor for new metadata
- Update database schema
- Modify sync script
- Update frontend display

## Security Notes

- File uploads validated (type, size)
- File paths sanitized
- No internal paths exposed in API responses
- Subprocess calls properly escaped

## Performance

- CLI processing: ~2-5 seconds per image
- Database queries: <100ms
- Frontend updates: Immediate
- Memory usage: Minimal (CLI runs in subprocess)

## Future Enhancements

- Batch processing for multiple uploads
- Real-time progress updates
- Advanced filtering based on metadata
- Outfit recommendations using new items
- Image optimization and resizing
