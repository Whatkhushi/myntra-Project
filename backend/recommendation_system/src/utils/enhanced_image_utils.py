"""
Enhanced image utilities for creating high-resolution collages
"""

import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from typing import List, Dict, Tuple
import random


def create_high_res_collage(
    item_images: List[Dict],
    output_path: str,
    width: int = 1200,
    height: int = 800,
    items_per_row: int = 3
) -> str:
    """
    Create a high-resolution collage of outfit items
    
    Args:
        item_images: List of dicts with 'image_path', 'id', 'category', 'subcategory', 'color'
        output_path: Path to save the collage
        width: Width of the collage
        height: Height of the collage
        items_per_row: Number of items per row
    
    Returns:
        Path to the saved collage
    """
    try:
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Load and resize images
        images = []
        labels = []
        
        for item in item_images:
            try:
                img_path = item.get('image_path', '')
                if os.path.exists(img_path):
                    img = Image.open(img_path)
                    # Resize maintaining aspect ratio
                    img.thumbnail((200, 200), Image.Resampling.LANCZOS)
                    images.append(img)
                    
                    # Create label
                    label = f"{item.get('id', '')}\n{item.get('category', '')}\n{item.get('subcategory', '')}"
                    labels.append(label)
                else:
                    # Create placeholder if image not found
                    placeholder = Image.new('RGB', (200, 200), color=(240, 240, 240))
                    images.append(placeholder)
                    labels.append(f"{item.get('id', '')}\nMissing")
            except Exception as e:
                print(f"Warning: Could not load image {item.get('image_path', '')}: {e}")
                # Create placeholder
                placeholder = Image.new('RGB', (200, 200), color=(240, 240, 240))
                images.append(placeholder)
                labels.append(f"{item.get('id', '')}\nError")
        
        if not images:
            # Create empty collage if no images
            collage = Image.new('RGB', (width, height), color=(255, 255, 255))
            collage.save(output_path)
            return output_path
        
        # Calculate grid layout
        num_items = len(images)
        rows = (num_items + items_per_row - 1) // items_per_row
        cols = min(items_per_row, num_items)
        
        # Calculate item size
        item_width = width // cols
        item_height = height // rows
        
        # Create collage
        collage = Image.new('RGB', (width, height), color=(255, 255, 255))
        
        # Place images
        for i, (img, label) in enumerate(zip(images, labels)):
            row = i // cols
            col = i % cols
            
            x = col * item_width
            y = row * item_height
            
            # Resize image to fit cell
            img_resized = img.resize((item_width - 20, item_height - 40), Image.Resampling.LANCZOS)
            
            # Paste image
            paste_x = x + 10
            paste_y = y + 10
            collage.paste(img_resized, (paste_x, paste_y))
            
            # Add label
            try:
                draw = ImageDraw.Draw(collage)
                # Try to use a default font, fallback to basic if not available
                try:
                    font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 12)
                except:
                    font = ImageFont.load_default()
                
                # Draw label background
                text_bbox = draw.textbbox((0, 0), label, font=font)
                text_width = text_bbox[2] - text_bbox[0]
                text_height = text_bbox[3] - text_bbox[1]
                
                label_x = x + (item_width - text_width) // 2
                label_y = y + item_height - 30
                
                # Draw background rectangle
                draw.rectangle([
                    label_x - 5, label_y - 2,
                    label_x + text_width + 5, label_y + text_height + 2
                ], fill=(255, 255, 255, 200))
                
                # Draw text
                draw.text((label_x, label_y), label, fill=(0, 0, 0), font=font)
            except Exception as e:
                print(f"Warning: Could not add label: {e}")
        
        # Save collage
        collage.save(output_path, quality=95)
        return output_path
        
    except Exception as e:
        print(f"Error creating collage: {e}")
        # Create a simple fallback collage
        try:
            fallback = Image.new('RGB', (width, height), color=(240, 240, 240))
            fallback.save(output_path)
            return output_path
        except:
            return ""