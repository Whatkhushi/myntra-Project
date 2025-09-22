# Add Item to Wardrobe System

## 🎯 Overview
The `add_item.py` system allows users to add new clothing items to their wardrobe with automatic classification and embedding generation. New items are immediately available as seed items in the recommendation system.

## 🚀 Features

### Interactive Item Addition
- **File Selection Dialog** - Choose images from your file system
- **Category Selection** - Select main category (tops, bottoms, shoes, accessories, dresses)
- **Automatic Classification** - System determines subcategory and all other metadata
- **Multiple Items** - Add single items or multiple items in one session

### Automatic Processing
- **Image Classification** - Uses existing CLIP-based classification pipeline
- **Metadata Extraction** - Generates complete metadata matching existing format
- **Embedding Generation** - Creates embeddings for similarity matching
- **Wardrobe Integration** - Items immediately available as seed items

### Data Persistence
- **Cross-Machine Compatibility** - Added items persist across different machines
- **Metadata Preservation** - All classifications and embeddings are saved
- **Unique IDs** - Each item gets a unique identifier

## 📁 Files Created/Modified

### New Files:
- `add_item.py` - Main item addition system
- `test_add_item.py` - Test script for add_item functionality
- `ADD_ITEM_README.md` - This documentation

### Modified Files:
- `interactive_custom_main.py` - Integrated item addition
- `custom_main.py` - Integrated item addition

## 🎮 How to Use

### Option 1: Standalone Item Addition
```bash
cd /Users/mishtyverma/closet-twin-style-3/backend/recommendation_system
python add_item.py
```

### Option 2: Through Interactive System
```bash
cd /Users/mishtyverma/closet-twin-style-3/backend/recommendation_system
python interactive_custom_main.py --interactive
# Select "yes" when asked about adding new items
```

### Option 3: Through Regular System
```bash
cd /Users/mishtyverma/closet-twin-style-3/backend/recommendation_system
python custom_main.py --all
# Select "yes" when asked about adding new items
```

## 📋 Step-by-Step Process

### 1. Start the System
When you run any of the above commands, you'll see:
```
➕ WARDROBE MANAGEMENT
============================================================
Do you want to add new items to your wardrobe before generating recommendations?
You can add images and they will be automatically classified and added to your wardrobe.

🔍 Add new items? (yes/no):
```

### 2. Select Number of Items
```
How many items would you like to add?
1. Add a single item
2. Add multiple items
3. Skip adding items

🔍 Enter your choice (1-3):
```

### 3. Select Image File
A file dialog will open allowing you to select an image file. Supported formats:
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- BMP (.bmp)
- TIFF (.tiff)

### 4. Select Main Category
```
📋 Select the main category for this item:
==================================================
1. Tops (shirts, blouses, camisoles, etc.)
2. Bottoms (jeans, skirts, pants, etc.)
3. Shoes (heels, sneakers, boots, etc.)
4. Accessories (bags, jewelry, belts, etc.)
5. Dresses (cocktail, maxi, mini, etc.)

🔍 Enter your choice (1-5):
```

### 5. Automatic Processing
The system will:
- Copy the image to the organized folder structure
- Classify the item using the existing pipeline
- Extract all metadata (subcategory, style tags, colors, etc.)
- Generate embeddings for similarity matching
- Add the item to the wardrobe dataset

### 6. Confirmation
```
🎉 Successfully added new item!
   Item ID: new_20250921_120000_abc12345
   Category: tops
   Subcategory: t_shirt
   Style: casual, streetwear
```

## 🔧 Technical Details

### Metadata Structure
Each added item gets complete metadata matching the existing `style.csv` format:

```python
{
    'id': 'new_20250921_120000_abc12345',  # Unique ID
    'filename': '/path/to/image.jpg',       # Image path
    'source': 'user_added',                # Source type
    'category': 'tops',                    # User-selected category
    'subcategory': 't_shirt',              # Auto-classified
    'style_tags': '["casual", "streetwear"]', # Auto-extracted
    'formality': 'casual',                 # Auto-classified
    'dominant_color_name': 'white',        # Auto-extracted
    'width_px': 800,                       # Image dimensions
    'height_px': 600,
    'emb_index': -1,                       # Will be updated
    'created_at': '2025-09-21T12:00:00'   # Timestamp
    # ... and many more fields
}
```

### File Organization
- **Images**: Copied to `data/output/organized/{Category}/`
- **Metadata**: Added to `data/processed/style.csv`
- **Embeddings**: Generated and stored in `data/processed/embeddings.npy`

### Classification Pipeline
Uses the existing `RobustClassifier` to extract:
- Subcategory (t_shirt, jeans, heels, etc.)
- Style tags (casual, elegant, party, etc.)
- Colors and patterns
- Fit and silhouette
- Formality and occasion
- And much more...

## 🎯 Integration with Recommendation System

### Immediate Availability
- New items are immediately available as seed items
- Can be selected in the interactive recommendation system
- Participate in outfit generation right away

### Recommendation Rules
- Follow all existing recommendation rules
- Dress pairing rules apply to new items
- Style matching works with existing items
- Complete outfit generation includes new items

### Example Usage
After adding a new item:
1. Run the interactive system
2. Select the new item as a seed item
3. Generate outfit recommendations
4. The new item will be highlighted as a seed item

## 🛡️ Data Integrity & Safety

### Validation
- **File Format**: Only valid image files accepted
- **Category Selection**: Only predefined categories allowed
- **Duplicate Prevention**: Unique IDs prevent conflicts
- **Error Handling**: Graceful handling of classification failures

### Project Safety
- **No Frontend/Backend Changes**: Only recommendation system modified
- **Preserved Logic**: All existing functionality maintained
- **Cross-Machine Compatibility**: Works on any machine with the project

## 🧪 Testing

### Test the System
```bash
cd /Users/mishtyverma/closet-twin-style-3/backend/recommendation_system
python test_add_item.py
```

### Test Integration
```bash
# Test with interactive system
python interactive_custom_main.py --interactive

# Test with regular system  
python custom_main.py --all
```

## 🎉 Benefits

### For Users
- **Easy Addition**: Simple file selection and category choice
- **Automatic Processing**: No need to manually classify items
- **Immediate Use**: Items available right away
- **Persistent Storage**: Items saved across sessions

### For the System
- **Seamless Integration**: Works with existing recommendation logic
- **Data Consistency**: Maintains existing metadata format
- **Scalability**: Can handle multiple items efficiently
- **Reliability**: Robust error handling and validation

## 🔮 Future Enhancements

### Potential Improvements
- **Batch Upload**: Upload multiple images at once
- **Image Preprocessing**: Automatic resizing and optimization
- **Style Analysis**: Enhanced style tag extraction
- **Duplicate Detection**: Prevent adding similar items
- **Metadata Editing**: Allow manual correction of classifications

The add_item system is now fully integrated and ready to use! 🎉
