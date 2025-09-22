from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import uuid
import time
from datetime import datetime
import base64
import requests
import logging
import subprocess
import json
import pandas as pd
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Debug: Check if API key is loaded
print("Gemini API key found?", bool(os.getenv("GEMINI_API_KEY")))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Explicit Outfit Rules (User-defined pairings) - Using database IDs
EXPLICIT_OUTFIT_RULES = {
    "12": [  # 3b30b0c5-4cc3-4cf2-8efc-e9ea725cebf6.jpg
        "6",   # 4ba0294d-ab7e-4806-8cb7-4787eb23e712.jpg
        "17",  # bb06e7a6-85ae-44d3-bdc9-cb395a7e520c.jpg
        "2"    # fd7d254e-a5f0-450c-9a94-ec3fd9a4a706.jpg
    ],
    "6": [   # 4ba0294d-ab7e-4806-8cb7-4787eb23e712.jpg
        "6",   # 4ba0294d-ab7e-4806-8cb7-4787eb23e712.jpg
        "17",  # bb06e7a6-85ae-44d3-bdc9-cb395a7e520c.jpg
        "2"    # fd7d254e-a5f0-450c-9a94-ec3fd9a4a706.jpg
    ],
    "15": [  # 8e8ba0bc-75fc-4b75-b922-bfa3a43096b8.jpg
        "2",   # fd7d254e-a5f0-450c-9a94-ec3fd9a4a706.jpg
        "1"    # 56a6f879-a788-43ee-bf16-7cfe924bee06.jpg
    ],
    "9": [   # 8f237eb5-72ab-4341-a49e-2a5f5c5db03d.jpg
        "2",   # fd7d254e-a5f0-450c-9a94-ec3fd9a4a706.jpg
        "1"    # 56a6f879-a788-43ee-bf16-7cfe924bee06.jpg
    ],
    "1": [   # 56a6f879-a788-43ee-bf16-7cfe924bee06.jpg
        "12"   # 3b30b0c5-4cc3-4cf2-8efc-e9ea725cebf6.jpg
    ],
    "3": [   # 64ff0526-8908-4d1a-8df2-249d0a415806.jpg
        "12"   # 3b30b0c5-4cc3-4cf2-8efc-e9ea725cebf6.jpg
    ],
    "10": [  # a0468aba-b0b4-4ec0-9235-faa80994bed5.jpg
        "7",   # d3bd0855-be52-4de6-bc01-00d0f37df170.jpg
        "17",  # bb06e7a6-85ae-44d3-bdc9-cb395a7e520c.jpg
        "5"    # f7f3b260-320a-4072-ae8f-69ec12fdeb33.jpg
    ],
    "17": [  # bb06e7a6-85ae-44d3-bdc9-cb395a7e520c.jpg
        "2",   # fd7d254e-a5f0-450c-9a94-ec3fd9a4a706.jpg
        "5",   # f7f3b260-320a-4072-ae8f-69ec12fdeb33.jpg
        "12",  # 3b30b0c5-4cc3-4cf2-8efc-e9ea725cebf6.jpg
        "6"    # 4ba0294d-ab7e-4806-8cb7-4787eb23e712.jpg
    ],
    "7": [   # d3bd0855-be52-4de6-bc01-00d0f37df170.jpg
        "11",  # fc84e773-6043-4168-a312-d6ae3c1d8c2f.jpg
        "17",  # bb06e7a6-85ae-44d3-bdc9-cb395a7e520c.jpg
        "5"    # f7f3b260-320a-4072-ae8f-69ec12fdeb33.jpg
    ],
    "4": [   # f6b654e4-7a92-4616-b83a-c0f2406e2a20.jpg
        "2"    # fd7d254e-a5f0-450c-9a94-ec3fd9a4a706.jpg
    ]
}

# Initialize Flask app
app = Flask(__name__)

# Configure CORS to allow requests from React frontend
# For development, allow all localhost origins
CORS(app, origins="*",  # Allow all origins for development
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///wardrobe.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configure upload settings
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB max file size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE
GEMINI_TEXT_MODEL = os.environ.get('GEMINI_TEXT_MODEL', 'gemini-1.5-pro')
GEMINI_IMAGE_MODEL = os.environ.get('GEMINI_IMAGE_MODEL', 'gemini-2.0-flash')
GOOGLE_API_BASE = os.environ.get('GOOGLE_API_BASE', 'https://generativelanguage.googleapis.com/v1beta')

# Initialize database
db = SQLAlchemy(app)

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Database Model
class WardrobeItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    image_url = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    subcategory = db.Column(db.String(100), nullable=True)
    style_tags = db.Column(db.Text, nullable=True)
    dominant_color_hex = db.Column(db.String(7), nullable=True)
    emb_index = db.Column(db.Integer, nullable=True)
    recommendation_id = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'image_url': self.image_url,
            'category': self.category,
            'subcategory': self.subcategory,
            'style_tags': self.style_tags,
            'dominant_color_hex': self.dominant_color_hex,
            'emb_index': self.emb_index,
            'recommendation_id': self.recommendation_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

# Helper functions
def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file):
    """Save uploaded file and return the filename"""
    if file and allowed_file(file.filename):
        # Generate unique filename to avoid conflicts
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        filename = secure_filename(unique_filename)
        
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Return relative path for database storage
        return f"/uploads/{filename}"
    return None

def _call_gemini_text_api(user_prompt: str) -> str:
    """Call Gemini text model to get a structured outfit suggestion."""
    try:
        import google.generativeai as genai
        
        # Configure the API
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        
        # Initialize the model (using flash for higher free tier limits)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        system_instructions = (
            "You are a world-class fashion stylist and image consultant. "
            "Respond with chic, wearable, context-appropriate looks. "
            "Break your answer into sections with these exact headings: "
            "Outfit, Accessories, Shoes, Hairstyle/Makeup, Style Inspiration. "
            "Keep language stylish and modern. Draw inspiration from Bollywood, Hollywood, top influencers, and recent fashion trends. "
            "Avoid context mismatches (e.g., no saree for beach, no heavy boots for summer)."
        )

        full_prompt = (
            f"System: {system_instructions}\n\n"
            f"User vibe/look: {user_prompt}\n\n"
            "Output format example (adapt the items to the user request):\n"
            "✨ Inspired by <reference>.\n"
            "- Outfit: <core outfit>\n"
            "- Accessories: <key accessories>\n"
            "- Shoes: <shoe choice>\n"
            "- Hairstyle/Makeup: <hair+makeup>\n"
            "- Style Inspiration: <names/looks>\n"
        )
        
        # Generate content
        response = model.generate_content(full_prompt)
        description = response.text.strip()
        
        if not description:
            raise ValueError("Empty description from model")
        return description
        
    except Exception as e:
        logger.error(f"Failed to generate text with Gemini: {e}")
        raise

def _build_image_prompt_from_description(description: str) -> str:
    """Convert the outfit description into an image generation prompt."""
    return (
        "Generate a high-quality, fashion-magazine style outfit image based on:\n"
        f"{description}\n"
        "The model should look stylish and realistic, photographed in natural lighting.\n"
        "Focus clearly on the outfit details with tasteful posing and clean composition."
    )

def _call_deepai_image_api(prompt: str) -> str:
    """Generate a fashion outfit image using DeepAI's text2img API."""
    try:
        deepai_api_key = os.getenv('DEEPAI_API_KEY')
        if not deepai_api_key:
            logger.error("DEEPAI_API_KEY is not set")
            return None
        
        # DeepAI API endpoint
        url = "https://api.deepai.org/api/text2img"
        
        # Headers with API key
        headers = {
            'Api-Key': deepai_api_key
        }
        
        # Data payload
        data = {
            'text': prompt
        }
        
        logger.info(f"Calling DeepAI with prompt: {prompt[:100]}...")
        
        # Make the request
        response = requests.post(url, headers=headers, data=data, timeout=60)
        response.raise_for_status()
        
        # Parse JSON response
        result = response.json()
        
        if 'output_url' in result:
            image_url = result['output_url']
            logger.info(f"DeepAI generated image: {image_url}")
            return image_url
        else:
            logger.error(f"DeepAI response missing output_url: {result}")
            return None
            
    except requests.exceptions.RequestException as e:
        logger.error(f"DeepAI API request failed: {e}")
        return None
    except Exception as e:
        logger.error(f"DeepAI image generation failed: {e}")
        return None


def _create_explicit_outfit(seed_item_id: str, wardrobe_df: pd.DataFrame) -> dict:
    """Create outfit based on explicit pairing rules"""
    try:
        # Get the seed item by database ID
        seed_item = wardrobe_df[wardrobe_df['id'] == seed_item_id]
        if seed_item.empty:
            logger.warning(f"Seed item {seed_item_id} not found in wardrobe")
            return None
        
        seed_item = seed_item.iloc[0]
        
        # Get the pairing rules for this seed item
        paired_item_ids = EXPLICIT_OUTFIT_RULES.get(seed_item_id, [])
        if not paired_item_ids:
            logger.warning(f"No explicit rules found for seed item {seed_item_id}")
            return None
        
        # Find the paired items in the wardrobe by database ID
        paired_items = []
        for item_id in paired_item_ids:
            item = wardrobe_df[wardrobe_df['id'] == item_id]
            if not item.empty:
                item_dict = item.iloc[0].to_dict()
                # Ensure image_url is properly formatted
                if item_dict.get('image_url') and not item_dict['image_url'].startswith('http'):
                    item_dict['image_url'] = f"http://localhost:5000{item_dict['image_url']}"
                paired_items.append(item_dict)
        
        if not paired_items:
            logger.warning(f"No paired items found for seed {seed_item_id}")
            return None
        
        # Create outfit description
        seed_category = seed_item.get('category', 'item')
        outfit_description = f"Stylish {seed_category} look with perfectly matched accessories"
        
        # Create styling tips
        styling_tips = [
            "This combination was curated for maximum style impact",
            "Perfect for both casual and semi-formal occasions",
            "Colors and styles are harmoniously balanced"
        ]
        
        # Create outfit collage path (we'll generate this)
        outfit_id = f"explicit_outfit_{seed_item_id}_{int(time.time())}"
        collage_path = f"recommendation_system/data/output/outfits/{outfit_id}.jpg"
        
        # Ensure output directory exists
        os.makedirs(os.path.dirname(collage_path), exist_ok=True)
        
        # For now, we'll use a placeholder or the first item's image as the outfit image
        # In a real implementation, you would create a collage here
        if paired_items:
            # Use the first item's image as the outfit image
            first_item_image = paired_items[0].get('image_url', '')
            if first_item_image and first_item_image.startswith('http://localhost:5000'):
                # Copy the first item's image to the outfit path
                import shutil
                source_path = first_item_image.replace('http://localhost:5000', '/Users/mishtyverma/closet-twin-style-6/backend')
                if os.path.exists(source_path):
                    shutil.copy2(source_path, collage_path)
        
        # Create outfit object - only return one outfit
        outfit = {
            'id': outfit_id,
            'description': outfit_description,
            'items': paired_items,
            'score': 0.95,  # High score for explicit rules
            'image_path': collage_path,
            'styling_tips': styling_tips,
            'seed_item_id': seed_item_id,
            'is_explicit': True
        }
        
        return outfit
        
    except Exception as e:
        logger.error(f"Error creating explicit outfit: {e}")
        return None

def _create_fashion_placeholder(image_prompt: str) -> bytes:
    """Create a styled placeholder image when real generation fails."""
    try:
        from PIL import Image, ImageDraw, ImageFont
        import io
        
        # Create a fashion-style placeholder
        img = Image.new('RGB', (400, 600), color='#f8f9fa')
        draw = ImageDraw.Draw(img)
        
        # Add a border
        draw.rectangle([10, 10, 390, 590], outline='#e9ecef', width=2)
        
        # Add title
        try:
            font_large = ImageFont.load_default()
            font_small = ImageFont.load_default()
        except:
            font_large = None
            font_small = None
        
        # Draw title
        title = "FASHION LOOK"
        draw.text((200, 50), title, fill='#495057', font=font_large, anchor='mm')
        
        # Draw outfit description (truncated)
        outfit_text = image_prompt[:100] + "..." if len(image_prompt) > 100 else image_prompt
        draw.text((200, 300), outfit_text, fill='#6c757d', font=font_small, anchor='mm')
        
        # Add "AI Generated" label
        draw.text((200, 550), "AI Generated Look", fill='#007bff', font=font_small, anchor='mm')
        
        # Convert to bytes
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        return img_bytes.getvalue()
        
    except Exception as e:
        logger.error(f"Failed to create placeholder: {e}")
        # Return a minimal fallback
        return base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')

def _save_generated_image(image_bytes: bytes) -> str:
    """Save image bytes to uploads and return public URL path."""
    unique_filename = f"{uuid.uuid4()}.png"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    with open(file_path, 'wb') as f:
        f.write(image_bytes)
    return f"/uploads/{unique_filename}"

# API Routes
@app.route('/api/wardrobe/upload', methods=['POST'])
def upload_wardrobe_item():
    """Upload a new wardrobe item with image and category"""
    try:
        # Check if request has the required parts
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        if 'category' not in request.form:
            return jsonify({'error': 'No category provided'}), 400
        
        file = request.files['image']
        category = request.form['category']
        
        # Validate file
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Allowed types: png, jpg, jpeg, gif, webp'}), 400
        
        # Normalize category (handle singular/plural variations)
        category_mapping = {
            'dress': 'dresses',
            'top': 'tops', 
            'bottom': 'bottoms',
            'accessory': 'accessories',
            'shoe': 'shoes'
        }
        normalized_category = category_mapping.get(category, category)
        
        # Validate category
        valid_categories = ['dresses', 'accessories', 'tops', 'bottoms', 'shoes']
        if normalized_category not in valid_categories:
            return jsonify({'error': f'Invalid category. Must be one of: {", ".join(valid_categories)}'}), 400
        
        # Use normalized category
        category = normalized_category
        
        # Save the file
        image_url = save_uploaded_file(file)
        if not image_url:
            return jsonify({'error': 'Failed to save image file'}), 500
        
        # Get full path to the uploaded file for recommendation system processing
        full_image_path = os.path.join(os.getcwd(), image_url.lstrip('/'))
        logger.info(f"Full image path: {full_image_path}")
        logger.info(f"File exists: {os.path.exists(full_image_path)}")
        
        # Process with recommendation system (optional)
        recommendation_metadata = None
        try:
            # Call the recommendation system CLI
            cli_path = os.path.join(os.getcwd(), 'recommendation_system', 'add_item_cli.py')
            cmd = [
                'python3', cli_path,
                '--file', full_image_path,
                '--main_category', category,
                '--source', 'wardrobe'
            ]
            
            logger.info(f"Calling recommendation system CLI: {' '.join(cmd)}")
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            logger.info(f"CLI return code: {result.returncode}")
            logger.info(f"CLI stdout: {result.stdout}")
            logger.info(f"CLI stderr: {result.stderr}")
            
            # Parse the JSON response (extract JSON from the end of output)
            if result.returncode == 0:
                # Find the JSON part (it should be the last line)
                lines = result.stdout.strip().split('\n')
                json_line = None
                for line in reversed(lines):
                    if line.strip().startswith('{'):
                        json_line = line.strip()
                        break
                
                if json_line:
                    cli_output = json.loads(json_line)
                    if cli_output['status'] == 'ok':
                        recommendation_metadata = cli_output['metadata']
                        logger.info(f"Recommendation system processing successful: {recommendation_metadata['id']}")
                    else:
                        logger.warning(f"Recommendation system processing failed: {cli_output.get('error', 'Unknown error')}")
                else:
                    logger.warning("No JSON found in CLI output")
            else:
                logger.warning(f"CLI failed with return code {result.returncode}")
                
        except subprocess.TimeoutExpired:
            logger.warning("Recommendation system CLI timed out")
        except subprocess.CalledProcessError as e:
            logger.warning(f"Recommendation system CLI failed: {e.stderr}")
        except Exception as e:
            logger.warning(f"Error calling recommendation system: {e}")
            # Continue without recommendation system processing
        
        # Create database record
        try:
            wardrobe_item = WardrobeItem(
                image_url=image_url,
                category=category,
                subcategory=recommendation_metadata.get('subcategory') if recommendation_metadata else None,
                style_tags=json.dumps(recommendation_metadata.get('classification', {}).get('style_tags', [])) if recommendation_metadata else None,
                dominant_color_hex=recommendation_metadata.get('classification', {}).get('dominant_color_hex') if recommendation_metadata else None,
                emb_index=recommendation_metadata.get('emb_index') if recommendation_metadata else None,
                recommendation_id=recommendation_metadata.get('id') if recommendation_metadata else None
            )
            db.session.add(wardrobe_item)
            db.session.commit()
            
            logger.info(f"Successfully saved wardrobe item: {wardrobe_item.id}")
            return jsonify(wardrobe_item.to_dict()), 201
            
        except Exception as db_error:
            db.session.rollback()
            logger.error(f"Database error: {str(db_error)}")
            return jsonify({'error': 'Failed to save item to database'}), 500
            
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        return jsonify({'error': 'Internal server error during upload'}), 500

@app.route('/api/wardrobe', methods=['GET'])
def get_wardrobe_items():
    """Get all wardrobe items"""
    try:
        items = WardrobeItem.query.order_by(WardrobeItem.created_at.desc()).all()
        return jsonify([item.to_dict() for item in items]), 200
        
    except Exception as e:
        logger.error(f"Error retrieving wardrobe items: {str(e)}")
        return jsonify({'error': 'Failed to retrieve wardrobe items'}), 500

@app.route('/api/wardrobe/<int:item_id>', methods=['DELETE'])
def delete_wardrobe_item(item_id):
    """Delete a specific wardrobe item"""
    try:
        item = WardrobeItem.query.get_or_404(item_id)
        
        # Delete the image file if it exists
        if item.image_url:
            image_path = item.image_url.lstrip('/')
            if os.path.exists(image_path):
                os.remove(image_path)
        
        db.session.delete(item)
        db.session.commit()
        
        return jsonify({'message': 'Item deleted successfully'}), 200
        
    except Exception as e:
        logger.error(f"Error deleting item {item_id}: {str(e)}")
        return jsonify({'error': 'Failed to delete item'}), 500

@app.route('/api/stylist/generate', methods=['POST'])
def generate_stylist_recommendation():
    """Generate outfit recommendations using the integrated recommendation system."""
    try:
        # 1. Parse JSON request body
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        user_prompt = data.get('prompt', '').strip()
        if not user_prompt:
            return jsonify({'error': 'No prompt provided'}), 400

        # 2. Extract optional parameters
        occasion = data.get('occasion', 'casual')
        num_outfits = data.get('num_outfits', 3)
        seed_item_ids = data.get('seed_item_ids', None)

        # 3. Use the recommendation system directly
        try:
            # Get user wardrobe data from database
            db_items = WardrobeItem.query.all()
            
            if not db_items:
                logger.warning("No wardrobe items found, using fallback")
                return _fallback_gemini_generation(user_prompt)
            
            logger.info(f"📊 Found {len(db_items)} user wardrobe items")
            
            # Convert database items to the format expected by recommendation system
            import pandas as pd
            
            wardrobe_data = []
            for item in db_items:
                wardrobe_data.append({
                    'id': str(item.id),  # Convert to string for consistency
                    'category': item.category,
                    'subcategory': item.subcategory or 'unknown',
                    'color': item.dominant_color_hex or 'unknown',
                    'style_tags': item.style_tags or ['casual'],
                    'image_url': item.image_url,
                    'description': f"{item.category} item",
                    'filename': item.image_url.split('/')[-1] if item.image_url else None
                })
            
            # Create DataFrame from user data
            user_wardrobe_df = pd.DataFrame(wardrobe_data)
            logger.info(f"📊 Created DataFrame with {len(user_wardrobe_df)} items")
            
            # Use recommendation system directly
            from generate_outfit_adapter import RobustDataManager, RobustOutfitRecommender
            import os
            
            raw_dir = 'recommendation_system/data/raw'
            processed_dir = 'recommendation_system/data/processed'
            output_dir = 'recommendation_system/data/output'
            
            logger.info("📊 Initializing recommendation system...")
            
            data_manager = RobustDataManager(
                raw_dir=raw_dir,
                processed_dir=processed_dir,
                output_dir=output_dir
            )
            
            logger.info("📊 Generating embeddings...")
            embedding_index = data_manager.generate_embeddings(user_wardrobe_df, pd.DataFrame(columns=['id', 'category', 'subcategory', 'color', 'style_tags', 'image_url', 'description']))
            
            logger.info("📊 Initializing recommender...")
            recommender = RobustOutfitRecommender(
                wardrobe_df=user_wardrobe_df,
                catalog_df=pd.DataFrame(columns=['id', 'category', 'subcategory', 'color', 'style_tags', 'image_url', 'description']),
                embedding_index=embedding_index,
                image_base_dir=raw_dir,
                output_dir=output_dir
            )
            
            # Use hardcoded outfit rules only
            outfits = []
            if seed_item_ids and len(seed_item_ids) == 1:
                # Single seed item - use hardcoded rules
                seed_id = seed_item_ids[0]
                explicit_outfit = _create_explicit_outfit(seed_id, user_wardrobe_df)
                if explicit_outfit:
                    outfits = [explicit_outfit]
                    logger.info(f"✅ Using hardcoded outfit rule for seed item {seed_id}")
                else:
                    logger.warning(f"⚠️ No hardcoded rule found for {seed_id}")
                    # Return empty outfit if no rule found
                    outfits = []
            else:
                logger.warning("⚠️ No single seed item provided for hardcoded rules")
                outfits = []
            
            if outfits:
                # Convert outfits to the expected format - only one outfit
                outfit = outfits[0]  # Take only the first outfit
                
                # Fix image URLs for individual items
                items = outfit.get('items', [])
                for item in items:
                    if item.get('image_url') and item['image_url'].startswith('/uploads/'):
                        item['image_url'] = f"http://localhost:5000{item['image_url']}"
                
                formatted_outfit = {
                    'id': 'outfit_1',
                    'title': 'Curated Look',
                    'description': outfit.get('description', f'Stylish {occasion} look'),
                    'occasion': occasion,
                    'score': outfit.get('score', 0.95),
                    'items': items,
                    'image_url': outfit.get('image_path'),
                    'styling_tips': outfit.get('styling_tips', [])
                }
                formatted_outfits = [formatted_outfit]
                
                result = {
                    'success': True,
                    'description': f"Curated outfit combination based on your selected item",
                    'image_url': None,
                    'outfits': formatted_outfits,
                    'total_outfits': 1,
                    'user_prompt': user_prompt,
                    'occasion': occasion,
                    'generated_at': datetime.now().isoformat(),
                    'metadata': {
                        'system_version': '1.0.0',
                        'recommendation_engine': 'hardcoded_rules'
                    }
                }
                
                logger.info("✅ Successfully generated hardcoded outfit combination")
            else:
                logger.warning("No outfits generated, using fallback")
                return _fallback_gemini_generation(user_prompt)
            
            # Check if generation was successful
            if not result.get('success', False):
                logger.error(f"Outfit generation failed: {result.get('error', 'Unknown error')}")
                return jsonify({
                    'error': result.get('error', 'Failed to generate outfit recommendations'),
                    'description': f"Sorry, I couldn't generate outfit recommendations for: {user_prompt}",
                    'image_url': None
                }), 500
            
            # Extract the first outfit for backward compatibility
            outfits = result.get('outfits', [])
            if outfits:
                first_outfit = outfits[0]
                description = first_outfit.get('description', f"Stylish {occasion} look inspired by: {user_prompt}")
                image_url = first_outfit.get('image_url', None)
            else:
                description = f"Stylish {occasion} look inspired by: {user_prompt}"
                image_url = None
            
            # Return response with both new format and backward compatibility
            response = {
                'description': description,
                'image_url': image_url,
                'outfits': outfits,
                'total_outfits': result.get('total_outfits', 0),
                'success': True,
                'metadata': result.get('metadata', {})
            }
            
            logger.info(f"Successfully generated {len(outfits)} outfit recommendations")
            return jsonify(response), 200
            
        except ImportError as import_error:
            logger.error(f"Failed to import outfit adapter: {import_error}")
            # Fallback to original Gemini-based approach
            return _fallback_gemini_generation(user_prompt)
            
        except Exception as adapter_error:
            logger.error(f"Outfit adapter error: {adapter_error}")
            # Fallback to original Gemini-based approach
            return _fallback_gemini_generation(user_prompt)

    except Exception as e:
        logger.error(f"Unexpected error in stylist generation: {e}")
        return jsonify({'error': 'Internal server error'}), 500


def _fallback_gemini_generation(user_prompt: str):
    """Fallback to original Gemini-based generation when adapter fails"""
    try:
        # Check API key
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key or api_key.strip() == '':
            return jsonify({'error': 'Gemini API key not set'}), 500

        # Generate outfit description using Gemini
        try:
            description = _call_gemini_text_api(user_prompt)
        except Exception as text_error:
            logger.error(f"Failed to generate text: {text_error}")
            return jsonify({'error': 'Gemini API request failed'}), 500

        # Generate reference image using DeepAI
        image_url = None
        try:
            # Build a clean image prompt from the outfit description
            image_prompt = _build_image_prompt_from_description(description)
            
            # Call DeepAI for image generation
            deepai_image_url = _call_deepai_image_api(image_prompt)
            
            if deepai_image_url:
                # DeepAI returns a direct URL, so we can use it directly
                image_url = deepai_image_url
                logger.info(f"Successfully generated image with DeepAI: {image_url}")
            else:
                # Fallback to styled placeholder if DeepAI fails
                logger.warning("DeepAI image generation failed, creating placeholder")
                image_bytes = _create_fashion_placeholder(image_prompt)
                image_url = _save_generated_image(image_bytes)
                logger.info(f"Created fallback image: {image_url}")
                
        except Exception as image_error:
            logger.error(f"Image generation failed: {image_error}")
            # Continue without image - don't crash the server

        # Return response
        return jsonify({
            'description': description,
            'image_url': image_url,
            'outfits': [],
            'total_outfits': 0,
            'success': True,
            'metadata': {'fallback': 'gemini_generation'}
        }), 200

    except Exception as e:
        logger.error(f"Fallback generation failed: {e}")
        return jsonify({'error': 'All generation methods failed'}), 500

@app.route('/api/trending', methods=['GET'])
def get_trending_styles():
    """Get trending styles based on holidays and seasons - always returns 3+ styles"""
    try:
        import requests
        from datetime import datetime, timedelta
        
        # Get current date and next 3 weeks
        today = datetime.now()
        three_weeks_from_now = today + timedelta(weeks=3)
        
        trending_styles = []
        
        # 1. Always add specific trending styles: Navratri, Diwali, Autumn
        trending_styles.extend([
            {
                "id": "navratri-style",
                "title": "Navratri Garba Look",
                "emoji": "💃",
                "description": "Dance & Celebration",
                "defaultPieces": ["chaniya choli", "dupatta", "jewelry", "comfortable shoes"],
                "category": "festival",
                "season": "autumn",
                "occasion": "festival",
                "holiday": "Navratri",
                "date": today.strftime('%Y-%m-%d')
            },
            {
                "id": "diwali-style",
                "title": "Diwali Festive Look",
                "emoji": "🪔",
                "description": "Festive Glam",
                "defaultPieces": ["embroidered kurta", "embroidered dupatta", "juttis", "gold jewelry"],
                "category": "festival",
                "season": "autumn",
                "occasion": "festival",
                "holiday": "Diwali",
                "date": today.strftime('%Y-%m-%d')
            },
            {
                "id": "autumn-style",
                "title": "Autumn Cozy Look",
                "emoji": "🍂",
                "description": "Layered & Stylish",
                "defaultPieces": ["knit sweater", "ankle boots", "wool scarf", "beanie"],
                "category": "season",
                "season": "autumn",
                "occasion": "seasonal",
                "date": today.strftime('%Y-%m-%d')
            }
        ])
        
        # 2. Try to fetch holidays and add 2+ holiday styles
        try:
            current_year = today.year
            holidays_response = requests.get(f'https://date.nager.at/api/v3/PublicHolidays/{current_year}/IN', timeout=5)
            
            if holidays_response.status_code == 200:
                holidays = holidays_response.json()
                
                # Filter upcoming holidays in next 3 weeks
                upcoming_holidays = []
                for holiday in holidays:
                    holiday_date = datetime.strptime(holiday['date'], '%Y-%m-%d')
                    if today <= holiday_date <= three_weeks_from_now:
                        upcoming_holidays.append(holiday)
                
                # Enhanced holiday to style mapping
                holiday_style_mapping = {
                    "Christmas Day": {
                        "id": "christmas-style",
                        "title": "Christmas Festive Look",
                        "emoji": "🎄",
                        "description": "Festive & Warm",
                        "defaultPieces": ["red sweater", "wool coat", "boots", "warm scarf"],
                        "season": "winter",
                        "occasion": "festive"
                    },
                    "New Year's Day": {
                        "id": "new-year-style",
                        "title": "New Year Glam Look",
                        "emoji": "✨",
                        "description": "Party Ready",
                        "defaultPieces": ["sequin dress", "heels", "statement jewelry", "clutch"],
                        "season": "winter",
                        "occasion": "party"
                    },
                    "Valentine's Day": {
                        "id": "valentines-style",
                        "title": "Valentine's Romance Look",
                        "emoji": "💖",
                        "description": "Romantic & Sweet",
                        "defaultPieces": ["pink dress", "red heels", "delicate jewelry", "perfume"],
                        "season": "winter",
                        "occasion": "romantic"
                    },
                    "Holi": {
                        "id": "holi-style",
                        "title": "Holi Color Fest Look",
                        "emoji": "🌈",
                        "description": "Colorful & Fun",
                        "defaultPieces": ["white kurta", "colorful dupatta", "comfortable shoes", "sunglasses"],
                        "season": "spring",
                        "occasion": "festival"
                    },
                    "Diwali": {
                        "id": "diwali-style",
                        "title": "Diwali Festive Look",
                        "emoji": "🪔",
                        "description": "Festive Glam",
                        "defaultPieces": ["embroidered kurta", "embroidered dupatta", "juttis", "gold jewelry"],
                        "season": "autumn",
                        "occasion": "festival"
                    },
                    "Dussehra": {
                        "id": "dussehra-style",
                        "title": "Dussehra Traditional Look",
                        "emoji": "🦸",
                        "description": "Traditional & Elegant",
                        "defaultPieces": ["silk kurta", "dhoti pants", "kolhapuri sandals", "traditional accessories"],
                        "season": "autumn",
                        "occasion": "festival"
                    },
                    "Eid al-Fitr": {
                        "id": "eid-style",
                        "title": "Eid Celebration Look",
                        "emoji": "🌙",
                        "description": "Elegant & Traditional",
                        "defaultPieces": ["embroidered kurta", "matching pants", "traditional shoes", "prayer cap"],
                        "season": "spring",
                        "occasion": "religious"
                    },
                    "Raksha Bandhan": {
                        "id": "rakhi-style",
                        "title": "Rakhi Traditional Look",
                        "emoji": "🎀",
                        "description": "Traditional & Festive",
                        "defaultPieces": ["ethnic kurta", "ethnic pants", "juttis", "traditional accessories"],
                        "season": "summer",
                        "occasion": "festival"
                    },
                    "Navratri": {
                        "id": "navratri-style",
                        "title": "Navratri Garba Look",
                        "emoji": "💃",
                        "description": "Dance & Celebration",
                        "defaultPieces": ["chaniya choli", "dupatta", "jewelry", "comfortable shoes"],
                        "season": "autumn",
                        "occasion": "festival"
                    }
                }
                
                # Add holiday styles (up to 4 more to ensure 3+ total)
                holiday_count = 0
                for holiday in upcoming_holidays:
                    if holiday_count >= 4:  # Limit to 4 holiday styles
                        break
                    holiday_name = holiday['name']
                    if holiday_name in holiday_style_mapping:
                        style = holiday_style_mapping[holiday_name]
                        trending_styles.append({
                            "id": style["id"],
                            "title": style["title"],
                            "emoji": style["emoji"],
                            "description": style["description"],
                            "defaultPieces": style["defaultPieces"],
                            "category": "festival",
                            "holiday": holiday_name,
                            "date": holiday['date'],
                            "season": style["season"],
                            "occasion": style["occasion"]
                        })
                        holiday_count += 1
                
        except Exception as e:
            logger.warning(f"Failed to fetch holidays: {e}")
        
        # We already have 3 trending styles, no need for additional fallbacks
        
        return jsonify({
            'styles': trending_styles[:5],  # Limit to 5 styles max
            'total': len(trending_styles),
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error in trending endpoint: {e}")
        return jsonify({'error': 'Failed to fetch trending styles'}), 500

@app.route('/api/product-search', methods=['GET'])
def search_products():
    """Search for products based on query with enhanced themed search"""
    try:
        query = request.args.get('q', '').strip()
        category = request.args.get('category', '').strip()
        season = request.args.get('season', '').strip()
        occasion = request.args.get('occasion', '').strip()
        limit = int(request.args.get('limit', 10))
        
        if not query:
            return jsonify({'error': 'Query parameter is required'}), 400
        
        # Enhanced product database with highly relevant themed items
        themed_products = {
            # Autumn Items - Warm, cozy, layered looks
            "autumn": [
                {
                    "id": "autumn_1",
                    "name": "Cashmere Wool Sweater",
                    "image": "/images/autumn/Screenshot 2025-09-20 202905.png",
                    "price": 3999,
                    "originalPrice": 5999,
                    "discount": 33,
                    "brand": "Warm & Cozy",
                    "rating": 4.6,
                    "category": "tops",
                    "colors": ["burgundy", "mustard", "olive"],
                    "tags": ["cashmere", "wool", "autumn", "warm", "sweater"]
                },
                {
                    "id": "autumn_2", 
                    "name": "Leather Chelsea Boots",
                    "image": "/images/autumn/Screenshot 2025-09-20 203143.png",
                    "price": 4599,
                    "originalPrice": 6999,
                    "discount": 34,
                    "brand": "BootCraft",
                    "rating": 4.5,
                    "category": "shoes",
                    "colors": ["brown", "black", "tan"],
                    "tags": ["leather", "chelsea", "autumn", "boots", "ankle"]
                },
                {
                    "id": "autumn_3",
                    "name": "Plaid Wool Scarf",
                    "image": "/images/autumn/Screenshot 2025-09-20 204053.png",
                    "price": 2199,
                    "originalPrice": 2999,
                    "discount": 27,
                    "brand": "Heritage Wool",
                    "rating": 4.7,
                    "category": "accessories",
                    "colors": ["burgundy", "navy", "green"],
                    "tags": ["plaid", "wool", "autumn", "scarf", "warm"]
                },
                {
                    "id": "autumn_4",
                    "name": "Knit Beanie Hat",
                    "image": "/images/autumn/Screenshot 2025-09-20 204208.png",
                    "price": 1299,
                    "originalPrice": 1799,
                    "discount": 28,
                    "brand": "Cozy Head",
                    "rating": 4.4,
                    "category": "accessories",
                    "colors": ["brown", "grey", "burgundy"],
                    "tags": ["beanie", "knit", "autumn", "hat", "warm"]
                },
                {
                    "id": "autumn_5",
                    "name": "Corduroy Jacket",
                    "image": "/images/autumn/Screenshot 2025-09-20 204352.png",
                    "price": 3299,
                    "originalPrice": 4499,
                    "discount": 27,
                    "brand": "Autumn Style",
                    "rating": 4.5,
                    "category": "outerwear",
                    "colors": ["brown", "olive", "burgundy"],
                    "tags": ["corduroy", "jacket", "autumn", "warm", "casual"]
                }
            ],
            # Diwali Items - Traditional festive wear
            "diwali": [
                {
                    "id": "diwali_1",
                    "name": "Heavy Embroidered Kurta Set",
                    "image": "/images/diwali/Screenshot 2025-09-20 190430.png",
                    "price": 4999,
                    "originalPrice": 7999,
                    "discount": 38,
                    "brand": "Royal Ethnic",
                    "rating": 4.8,
                    "category": "tops",
                    "colors": ["red", "maroon", "gold", "burgundy"],
                    "tags": ["embroidered", "heavy", "festive", "diwali", "kurta", "ethnic"]
                },
                {
                    "id": "diwali_2",
                    "name": "Silk Saree with Zari Work",
                    "image": "/images/diwali/Screenshot 2025-09-20 191813.png",
                    "price": 8999,
                    "originalPrice": 12999,
                    "discount": 31,
                    "brand": "Silk Heritage",
                    "rating": 4.9,
                    "category": "dresses",
                    "colors": ["red", "gold", "maroon", "burgundy"],
                    "tags": ["silk", "zari", "saree", "diwali", "festive", "traditional"]
                },
                {
                    "id": "diwali_3",
                    "name": "Golden Jutti Shoes",
                    "image": "/images/diwali/Screenshot 2025-09-20 191948.png",
                    "price": 2299,
                    "originalPrice": 3299,
                    "discount": 30,
                    "brand": "Heritage Footwear",
                    "rating": 4.6,
                    "category": "shoes",
                    "colors": ["gold", "red", "brown", "maroon"],
                    "tags": ["jutti", "golden", "ethnic", "diwali", "traditional", "shoes"]
                },
                {
                    "id": "diwali_4",
                    "name": "Heavy Dupatta with Embroidery",
                    "image": "/images/diwali/Screenshot 2025-09-20 192132.png",
                    "price": 2999,
                    "originalPrice": 3999,
                    "discount": 25,
                    "brand": "Silk Route",
                    "rating": 4.7,
                    "category": "accessories",
                    "colors": ["red", "gold", "maroon", "burgundy"],
                    "tags": ["dupatta", "heavy", "embroidered", "diwali", "festive", "ethnic"]
                },
                {
                    "id": "diwali_5",
                    "name": "Traditional Gold Jewelry Set",
                    "image": "/images/diwali/Screenshot 2025-09-20 192340.png",
                    "price": 5999,
                    "originalPrice": 8999,
                    "discount": 33,
                    "brand": "Heritage Jewelry",
                    "rating": 4.8,
                    "category": "accessories",
                    "colors": ["gold", "silver"],
                    "tags": ["jewelry", "gold", "traditional", "diwali", "festive", "ethnic"]
                }
            ],
            # Navratri Items - Garba dance wear
            "navratri": [
                {
                    "id": "navratri_1",
                    "name": "Mirror Work Chaniya Choli",
                    "image": "/images/navratri/Screenshot 2025-09-20 193528.png",
                    "price": 5999,
                    "originalPrice": 8999,
                    "discount": 33,
                    "brand": "Garba Queen",
                    "rating": 4.9,
                    "category": "dresses",
                    "colors": ["pink", "orange", "yellow", "green", "red"],
                    "tags": ["chaniya", "choli", "mirror", "garba", "navratri", "festive", "dance"]
                },
                {
                    "id": "navratri_2",
                    "name": "Heavy Embroidered Dupatta",
                    "image": "/images/navratri/Screenshot 2025-09-20 194537.png",
                    "price": 2499,
                    "originalPrice": 3499,
                    "discount": 29,
                    "brand": "Garba Style",
                    "rating": 4.7,
                    "category": "accessories",
                    "colors": ["pink", "orange", "yellow", "green"],
                    "tags": ["dupatta", "embroidered", "garba", "navratri", "festive", "dance"]
                },
                {
                    "id": "navratri_3",
                    "name": "Traditional Garba Jewelry Set",
                    "image": "/images/navratri/Screenshot 2025-09-20 200554.png",
                    "price": 3999,
                    "originalPrice": 5999,
                    "discount": 33,
                    "brand": "Heritage Jewelry",
                    "rating": 4.8,
                    "category": "accessories",
                    "colors": ["gold", "silver", "rose gold"],
                    "tags": ["jewelry", "traditional", "garba", "navratri", "festive", "gold"]
                },
                {
                    "id": "navratri_4",
                    "name": "Comfortable Garba Shoes",
                    "image": "/images/navratri/Screenshot 2025-09-20 200838.png",
                    "price": 2299,
                    "originalPrice": 3299,
                    "discount": 30,
                    "brand": "Dance Comfort",
                    "rating": 4.6,
                    "category": "shoes",
                    "colors": ["gold", "silver", "black", "brown"],
                    "tags": ["shoes", "comfortable", "garba", "navratri", "dance", "traditional"]
                },
                {
                    "id": "navratri_5",
                    "name": "Anklets with Bells",
                    "image": "/images/navratri/Screenshot 2025-09-20 201116.png",
                    "price": 1299,
                    "originalPrice": 1999,
                    "discount": 35,
                    "brand": "Garba Accessories",
                    "rating": 4.5,
                    "category": "accessories",
                    "colors": ["gold", "silver"],
                    "tags": ["anklets", "bells", "garba", "navratri", "dance", "traditional"]
                }
            ],
            # Winter Items
            "winter": [
                {
                    "id": "winter_1",
                    "name": "Wool Coat",
                    "image": "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop&crop=center",
                    "price": 4599,
                    "originalPrice": 5999,
                    "discount": 23,
                    "brand": "WinterWear",
                    "rating": 4.5,
                    "category": "outerwear",
                    "colors": ["black", "navy", "grey"],
                    "tags": ["wool", "coat", "warm", "winter", "formal"]
                },
                {
                    "id": "winter_2",
                    "name": "Cashmere Scarf",
                    "image": "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400&h=400&fit=crop&crop=center",
                    "price": 1899,
                    "originalPrice": 2499,
                    "discount": 24,
                    "brand": "LuxuryWarmth",
                    "rating": 4.7,
                    "category": "accessories",
                    "colors": ["red", "grey", "black"],
                    "tags": ["cashmere", "warm", "luxury", "winter", "scarf"]
                }
            ],
            # Summer Items
            "summer": [
                {
                    "id": "summer_1",
                    "name": "Flowy Maxi Dress",
                    "image": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop&crop=center",
                    "price": 2899,
                    "originalPrice": 3699,
                    "discount": 22,
                    "brand": "Boho Chic",
                    "rating": 4.4,
                    "category": "dresses",
                    "colors": ["floral", "white", "pink"],
                    "tags": ["maxi", "boho", "floral", "summer", "beach"]
                },
                {
                    "id": "summer_2",
                    "name": "Straw Hat",
                    "image": "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400&h=400&fit=crop&crop=center",
                    "price": 899,
                    "originalPrice": 1199,
                    "discount": 25,
                    "brand": "Beach Vibes",
                    "rating": 4.2,
                    "category": "accessories",
                    "colors": ["beige", "white", "brown"],
                    "tags": ["hat", "straw", "summer", "beach", "sun"]
                }
            ]
        }
        
        # Search logic based on query and filters
        all_products = []
        
        # If specific season/occasion is requested, prioritize those
        if season and season in themed_products:
            all_products.extend(themed_products[season])
        
        if occasion and occasion in themed_products:
            all_products.extend(themed_products[occasion])
        
        # If we have theme-specific products, use only those
        if all_products:
            # For Diwali theme, always return ALL Diwali products regardless of query
            if occasion == "diwali":
                all_products = themed_products["diwali"]
            # For Navratri theme, always return ALL Navratri products regardless of query  
            elif occasion == "navratri":
                all_products = themed_products["navratri"]
            # For Autumn theme, always return ALL Autumn products regardless of query
            elif season == "autumn":
                all_products = themed_products["autumn"]
            else:
                # Filter by query within the theme-specific products
                query_lower = query.lower()
                filtered_products = []
                for product in all_products:
                    if (query_lower in product["name"].lower() or 
                        query_lower in " ".join(product["tags"]).lower() or
                        query_lower in product["category"].lower() or
                        query_lower in product["brand"].lower()):
                        filtered_products.append(product)
                
                # If no matches found in theme products, return all theme products
                if filtered_products:
                    all_products = filtered_products
        else:
            # Fallback: search through all themed products
            query_lower = query.lower()
            for theme, products in themed_products.items():
                for product in products:
                    if (query_lower in product["name"].lower() or 
                        query_lower in " ".join(product["tags"]).lower() or
                        query_lower in product["category"].lower()):
                        if product not in all_products:  # Avoid duplicates
                            all_products.append(product)
        
        # If no specific matches, add some general products
        if not all_products:
            general_products = [
                {
                    "id": f"general_{i}",
                    "name": f"{query.title()} Product {i}",
                    "image": f"https://images.unsplash.com/photo-{1551698618 + i}?w=400&h=400&fit=crop&crop=center",
                    "price": 1000 + (i * 500),
                    "originalPrice": 1500 + (i * 500),
                    "discount": 20 + (i * 5),
                    "brand": f"Brand {i}",
                    "rating": 4.0 + (i * 0.1),
                    "category": category or "general",
                    "colors": ["red", "blue", "black"],
                    "tags": [query.lower(), "trendy", "fashion"]
                }
                for i in range(1, min(limit + 1, 6))
            ]
            all_products.extend(general_products)
        
        # Limit results
        final_products = all_products[:limit]
        
        return jsonify({
            'products': final_products,
            'query': query,
            'season': season,
            'occasion': occasion,
            'total': len(final_products)
        }), 200
        
    except Exception as e:
        logger.error(f"Error in product search: {e}")
        return jsonify({'error': 'Failed to search products'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Wardrobe API is running'}), 200

@app.route('/api/test-outfit', methods=['POST'])
def test_outfit():
    """Test outfit generation endpoint"""
    try:
        logger.info("🧪 Testing outfit generation...")
        
        # Get user wardrobe data
        db_items = WardrobeItem.query.all()
        
        if not db_items:
            return jsonify({'error': 'No wardrobe items found'}), 400
        
        logger.info(f"📊 Found {len(db_items)} wardrobe items")
        
        # Convert to DataFrame
        import pandas as pd
        wardrobe_data = []
        for item in db_items:
            wardrobe_data.append({
                'id': str(item.id),
                'category': item.category,
                'subcategory': item.subcategory or 'unknown',
                'color': item.dominant_color_hex or 'unknown',
                'style_tags': item.style_tags or ['casual'],
                'image_url': item.image_url,
                'description': f"{item.category} item",
                'filename': item.image_url.split('/')[-1] if item.image_url else None
            })
        
        user_wardrobe_df = pd.DataFrame(wardrobe_data)
        logger.info(f"📊 Created DataFrame with {len(user_wardrobe_df)} items")
        
        # Use recommendation system directly
        from generate_outfit_adapter import RobustDataManager, RobustOutfitRecommender
        import os
        
        raw_dir = 'recommendation_system/data/raw'
        processed_dir = 'recommendation_system/data/processed'
        output_dir = 'recommendation_system/data/output'
        
        logger.info("📊 Initializing recommendation system...")
        
        data_manager = RobustDataManager(
            raw_dir=raw_dir,
            processed_dir=processed_dir,
            output_dir=output_dir
        )
        
        logger.info("📊 Generating embeddings...")
        embedding_index = data_manager.generate_embeddings(user_wardrobe_df, pd.DataFrame(columns=['id', 'category', 'subcategory', 'color', 'style_tags', 'image_url', 'description']))
        
        logger.info("📊 Initializing recommender...")
        recommender = RobustOutfitRecommender(
            wardrobe_df=user_wardrobe_df,
            catalog_df=pd.DataFrame(columns=['id', 'category', 'subcategory', 'color', 'style_tags', 'image_url', 'description']),
            embedding_index=embedding_index,
            image_base_dir=raw_dir,
            output_dir=output_dir
        )
        
        # Generate outfits
        logger.info("🎯 Generating outfits...")
        outfits = recommender.recommend_outfits(
            seed_item_ids=user_wardrobe_df['id'].tolist()[:3],
            occasion='casual',
            num_outfits=1
        )
        
        logger.info(f"✅ Generated {len(outfits)} outfits")
        
        return jsonify({
            'success': True,
            'outfits': outfits,
            'wardrobe_items': len(user_wardrobe_df),
            'outfit_count': len(outfits)
        }), 200
        
    except Exception as e:
        logger.error(f"Test outfit error: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@app.route('/api/test-explicit', methods=['POST'])
def test_explicit_outfit():
    """Test explicit outfit generation"""
    try:
        # Get user wardrobe data
        db_items = WardrobeItem.query.all()
        
        if not db_items:
            return jsonify({'error': 'No wardrobe items found'}), 400
        
        # Convert to DataFrame
        import pandas as pd
        wardrobe_data = []
        for item in db_items:
            wardrobe_data.append({
                'id': str(item.id),
                'category': item.category,
                'subcategory': item.subcategory or 'unknown',
                'color': item.dominant_color_hex or 'unknown',
                'style_tags': item.style_tags or ['casual'],
                'image_url': item.image_url,
                'description': f"{item.category} item",
                'filename': item.image_url.split('/')[-1] if item.image_url else None
            })
        
        user_wardrobe_df = pd.DataFrame(wardrobe_data)
        
        # Test explicit outfit for a specific seed item
        seed_id = "1e346d74-5913-46f6-8774-a8f905a1dc38"
        explicit_outfit = _create_explicit_outfit(seed_id, user_wardrobe_df)
        
        return jsonify({
            'success': True,
            'seed_id': seed_id,
            'explicit_outfit': explicit_outfit,
            'wardrobe_items': len(user_wardrobe_df),
            'sample_items': user_wardrobe_df[['id', 'image_url']].head().to_dict('records')
        }), 200
        
    except Exception as e:
        logger.error(f"Test explicit outfit error: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@app.route('/api/test-upload', methods=['POST'])
def test_upload():
    """Test upload endpoint without recommendation system"""
    try:
        logger.info("🧪 Testing upload without recommendation system...")
        
        # Check if request has the required parts
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        if 'category' not in request.form:
            return jsonify({'error': 'No category provided'}), 400
        
        file = request.files['image']
        category = request.form['category']
        
        # Validate file
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Allowed types: png, jpg, jpeg, gif, webp'}), 400
        
        # Normalize category (handle singular/plural variations)
        category_mapping = {
            'dress': 'dresses',
            'top': 'tops', 
            'bottom': 'bottoms',
            'accessory': 'accessories',
            'shoe': 'shoes'
        }
        normalized_category = category_mapping.get(category, category)
        
        # Validate category
        valid_categories = ['dresses', 'accessories', 'tops', 'bottoms', 'shoes']
        if normalized_category not in valid_categories:
            return jsonify({'error': f'Invalid category. Must be one of: {", ".join(valid_categories)}'}), 400
        
        # Use normalized category
        category = normalized_category
        
        # Save the file
        image_url = save_uploaded_file(file)
        if not image_url:
            return jsonify({'error': 'Failed to save image file'}), 500
        
        logger.info(f"✅ File saved successfully: {image_url}")
        
        # Create database record without recommendation system
        try:
            wardrobe_item = WardrobeItem(
                image_url=image_url,
                category=category,
                subcategory=None,
                style_tags=None,
                dominant_color_hex=None,
                emb_index=None,
                recommendation_id=None
            )
            db.session.add(wardrobe_item)
            db.session.commit()
            
            logger.info(f"✅ Successfully saved wardrobe item: {wardrobe_item.id}")
            return jsonify(wardrobe_item.to_dict()), 201
            
        except Exception as db_error:
            db.session.rollback()
            logger.error(f"Database error: {str(db_error)}")
            return jsonify({'error': 'Failed to save item to database'}), 500
            
    except Exception as e:
        logger.error(f"Test upload error: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': 'Internal server error during upload', 'traceback': traceback.format_exc()}), 500

@app.route('/api/style-card', methods=['GET'])
def get_style_card():
    """Get style card data based on wardrobe items"""
    try:
        # Style mapping from backend styles to Gen-Z vibes
        STYLE_MAPPING = {
            "casual": "streetwear",
            "ethnic": "girly_pop", 
            "formal": "boss_babe",
            "party": "edgy",
            "bohemian": "grunge",
            "minimalist": "clean_girl",
            "elegant": "boss_babe",
            "girly": "girly_pop",
            "denim": "streetwear",
            "practical": "clean_girl",
            "edgy": "edgy",
            "classic": "clean_girl",
            "trendy": "streetwear",
            "streetwear": "streetwear",
            "vintage": "grunge",
            "glam": "boss_babe",
            "y2k": "edgy",
            "boho": "grunge"
        }
        
        # Get wardrobe items from database
        wardrobe_items = WardrobeItem.query.filter(WardrobeItem.recommendation_id.isnot(None)).all()
        
        if not wardrobe_items:
            return jsonify({
                "girly_pop": 0,
                "edgy": 0,
                "streetwear": 0,
                "clean_girl": 0,
                "boss_babe": 0,
                "grunge": 0,
                "total_items": 0
            }), 200
        
        # Count styles for wardrobe items using database data directly
        style_counts = {}
        total_items = 0
        
        for item in wardrobe_items:
            if item.style_tags:
                try:
                    # Parse style_tags from database
                    tags = json.loads(item.style_tags)
                    total_items += 1
                    
                    for tag in tags:
                        # Map to Gen-Z vibe
                        vibe = STYLE_MAPPING.get(tag, "clean_girl")  # default to clean_girl
                        style_counts[vibe] = style_counts.get(vibe, 0) + 1
                except (json.JSONDecodeError, TypeError):
                    continue
        
        # Calculate percentages
        if total_items == 0:
            return jsonify({
                "girly_pop": 0,
                "edgy": 0,
                "streetwear": 0,
                "clean_girl": 0,
                "boss_babe": 0,
                "grunge": 0,
                "total_items": 0
            }), 200
        
        # Convert to percentages
        percentages = {}
        for vibe, count in style_counts.items():
            percentages[vibe] = round((count / total_items) * 100, 1)
        
        # Ensure all vibes are present with 0 if not found
        all_vibes = ["girly_pop", "edgy", "streetwear", "clean_girl", "boss_babe", "grunge"]
        for vibe in all_vibes:
            if vibe not in percentages:
                percentages[vibe] = 0
        
        percentages["total_items"] = total_items
        
        logger.info(f"Style card generated for {total_items} items: {percentages}")
        return jsonify(percentages), 200
        
    except Exception as e:
        logger.error(f"Error generating style card: {str(e)}")
        return jsonify({'error': 'Failed to generate style card'}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded images"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/outfit-image', methods=['GET'])
def serve_outfit_image():
    """Serve outfit collage images"""
    try:
        image_path = request.args.get('path')
        if not image_path:
            return jsonify({'error': 'No image path provided'}), 400
        
        # Check if file exists
        if not os.path.exists(image_path):
            return jsonify({'error': 'Image not found'}), 404
        
        # Serve the image file
        return send_file(image_path, mimetype='image/jpeg')
        
    except Exception as e:
        logger.error(f"Error serving outfit image: {e}")
        return jsonify({'error': 'Failed to serve image'}), 500

@app.route('/static/wardrobe_images/<filename>')
def wardrobe_image(filename):
    """Serve wardrobe images from static folder"""
    return send_from_directory(os.path.join(os.getcwd(), 'static', 'wardrobe_images'), filename)

# Error handlers
@app.errorhandler(413)
def too_large(e):
    return jsonify({'error': 'File too large. Maximum size is 16MB'}), 413

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500

# Initialize database tables
def create_tables():
    """Create database tables"""
    with app.app_context():
        db.create_all()
        logger.info("Database tables created successfully")

if __name__ == '__main__':
    create_tables()
    app.run(debug=True, host='0.0.0.0', port=5000)
