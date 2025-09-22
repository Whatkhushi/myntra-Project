#!/usr/bin/env python3
"""
Quick launcher for the Interactive Custom Wardrobe System
"""

import subprocess
import sys
import os

def main():
    print("🎨 Interactive Custom Wardrobe System Launcher")
    print("=" * 50)
    
    # Change to the correct directory
    os.chdir('/Users/mishtyverma/closet-twin-style-3/backend/recommendation_system')
    
    print("🚀 Starting interactive system...")
    print("This will open the interactive wardrobe selector where you can:")
    print("• Choose your seed items")
    print("• Select occasion (casual, formal, party, semi-formal)")
    print("• Generate multiple outfit recommendations")
    print("• Get detailed outfit analysis with vibes and style tags")
    print()
    
    try:
        # Run the interactive system
        subprocess.run([sys.executable, 'interactive_custom_main.py', '--interactive'], check=True)
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye! Thanks for using the Interactive Custom Wardrobe System!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
