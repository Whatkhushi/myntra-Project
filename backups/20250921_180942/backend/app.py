from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime
import base64
import requests
import logging
import subprocess
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Debug: Check if API key is loaded
print("Gemini API key found?", bool(os.getenv("GEMINI_API_KEY")))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
        
        # Validate category
        valid_categories = ['dresses', 'accessories', 'tops', 'bottoms', 'shoes']
        if category not in valid_categories:
            return jsonify({'error': f'Invalid category. Must be one of: {", ".join(valid_categories)}'}), 400
        
        # Save the file
        image_url = save_uploaded_file(file)
        if not image_url:
            return jsonify({'error': 'Failed to save image file'}), 500
        
        # Get full path to the uploaded file for recommendation system processing
        full_image_path = os.path.join(os.getcwd(), image_url.lstrip('/'))
        logger.info(f"Full image path: {full_image_path}")
        logger.info(f"File exists: {os.path.exists(full_image_path)}")
        
        # Process with recommendation system
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
            result = subprocess.run(cmd, capture_output=True, text=True)
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
                
        except subprocess.CalledProcessError as e:
            logger.warning(f"Recommendation system CLI failed: {e.stderr}")
        except Exception as e:
            logger.warning(f"Error calling recommendation system: {e}")
        
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
    """Generate outfit description and reference image using Gemini."""
    try:
        # 1. Check API key
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key or api_key.strip() == '':
            return jsonify({'error': 'Gemini API key not set'}), 500

        # 2. Parse JSON request body
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        user_prompt = data.get('prompt', '').strip()
        if not user_prompt:
            return jsonify({'error': 'No prompt provided'}), 400

        # 3. Generate outfit description using Gemini
        try:
            description = _call_gemini_text_api(user_prompt)
        except Exception as text_error:
            logger.error(f"Failed to generate text: {text_error}")
            return jsonify({'error': 'Gemini API request failed'}), 500

        # 4. Generate reference image using DeepAI
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

        # 5. Return response
        return jsonify({
            'description': description,
            'image_url': image_url
        }), 200

    except Exception as e:
        logger.error(f"Unexpected error in stylist generation: {e}")
        return jsonify({'error': 'Internal server error'}), 500

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

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded images"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

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
