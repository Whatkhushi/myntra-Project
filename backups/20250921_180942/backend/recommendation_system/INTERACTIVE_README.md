# Interactive Custom Wardrobe System

## 🎨 Overview
An enhanced interactive version of the custom wardrobe recommendation system that allows you to:
- Select seed items interactively from your wardrobe
- Choose occasions and number of outfits
- Get detailed outfit recommendations with style analysis
- Follow special dress pairing rules

## 🚀 Quick Start

### Option 1: Simple Launcher (Recommended)
```bash
cd /Users/mishtyverma/closet-twin-style-3/backend/recommendation_system
python launch_interactive.py
```

### Option 2: Direct Launch
```bash
cd /Users/mishtyverma/closet-twin-style-3/backend/recommendation_system
python interactive_custom_main.py --interactive
```

### Option 3: Clean Start
```bash
cd /Users/mishtyverma/closet-twin-style-3/backend/recommendation_system
python interactive_custom_main.py --clean
python interactive_custom_main.py --interactive
```

## 🎯 Features

### Interactive Seed Selection
- View all available wardrobe items with categories and style tags
- Select multiple seed items by entering their IDs
- Input validation and helpful error messages
- Special commands: `help`, `list`, `quit`

### Dress Pairing Rules
- **Cannot pair dress with dress** - System will prevent this
- **One dress only** - If you select a dress, it pairs with shoes, earrings, bracelets, and necklaces only
- **Other items** - Tops, bottoms, accessories can be paired normally

### Enhanced Recommendations
- Detailed outfit display with categorized items
- Style tags and color information for each item
- Overall vibe analysis for each outfit
- Seed items highlighted with ⭐
- High-resolution outfit collages

### User-Friendly Interface
- Clear prompts and instructions
- Help system with commands
- Graceful error handling
- Option to generate multiple rounds of outfits

## 📋 Available Commands

### During Seed Selection:
- `custom_000,custom_001` - Select multiple items
- `help` - Show help information
- `list` - Show wardrobe items again
- `quit` - Exit the system

### During Occasion Selection:
- `1` or `casual` - Casual outfits
- `2` or `formal` - Formal outfits
- `3` or `party` - Party outfits
- `4` or `semi-formal` - Semi-formal outfits

## 🎨 Your Custom Wardrobe Items

| ID | Category | Subcategory | Style Tags |
|----|----------|-------------|------------|
| custom_000 | bottom | skirt | girly, elegant |
| custom_001 | bag | tote | casual, practical |
| custom_002 | bottom | jeans | casual, denim |
| custom_003 | accessories | bracelets | girly, elegant |
| custom_004 | bottom | jeans | casual, denim |
| custom_005 | dress | cocktail_dress | party, elegant |
| custom_006 | dress | cocktail_dress | party, elegant |
| custom_007 | accessories | belts | edgy, classic |
| custom_008 | top | t_shirt | casual, streetwear |
| custom_009 | bag | bucket_bag | casual, trendy |
| custom_010 | top | camisole | casual, girly |
| custom_011 | dress | cocktail_dress | party, elegant |
| custom_012 | dress | cocktail_dress | party, elegant |

## 🔧 Technical Details

### Files Modified/Created:
- `interactive_custom_main.py` - Main interactive system
- `launch_interactive.py` - Simple launcher script
- `INTERACTIVE_README.md` - This documentation

### Preserved Logic:
- All existing recommendation rules
- Manual classifications from organized folders
- Embedding generation and storage
- High-resolution collage generation
- Complete outfit validation

### New Features:
- Interactive seed selection with validation
- Dress pairing rule enforcement
- Enhanced recommendation display
- Style analysis and vibe detection
- User-friendly error handling

## 🎯 Example Usage

1. **Start the system:**
   ```bash
   python launch_interactive.py
   ```

2. **Select seed items:**
   ```
   🔍 Enter seed item IDs: custom_010,custom_002
   ✅ Selected 2 seed item(s): custom_010, custom_002
   ```

3. **Choose occasion:**
   ```
   🔍 Enter occasion (1-4) or type the name: 3
   ✅ Selected occasion: party
   ```

4. **Set number of outfits:**
   ```
   🔍 How many outfits to generate (1-5): 3
   ✅ Will generate 3 outfit(s)
   ```

5. **View results:**
   ```
   👗 RECOMMENDED OUTFITS
   ================================================================================
   
   🎯 OUTFIT 1 (Score: 0.85)
   --------------------------------------------------
   📝 Description: top - camisole + bottom - jeans + shoes - heels + accessories - bracelets + bag - bucket_bag
   🎭 Occasion: party
   
   📋 Items in this outfit:
   ------------------------------
   
     TOP:
       ⭐ camisole (white, casual, girly)
         └─ SEED ITEM
   
     BOTTOM:
       ⭐ jeans (blue, casual, denim)
         └─ SEED ITEM
   
     SHOES:
       heels (black, elegant)
   
     ACCESSORIES:
       bracelets (gold, girly, elegant)
   
     BAG:
       bucket_bag (brown, casual, trendy)
   
   🎨 Overall Vibe: casual
   ```

## 🎉 Enjoy Your Interactive Wardrobe System!
