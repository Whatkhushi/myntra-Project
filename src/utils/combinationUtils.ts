// Hardcoded combination detection utility
export interface CombinationItem {
  id: string;
  name: string;
  image: string;
  category: string;
  isOwned: boolean;
}

export interface HardcodedOutfit {
  id: string;
  title: string;
  caption: string;
  items: CombinationItem[];
  type: 'hardcoded-combination';
  score: number;
}

// Combination mappings based on filename
const COMBINATION_MAPPINGS = {
  'combination1': [
    '3b30b0c5-4cc3-4cf2-8efc-e9ea725cebf6.jpg',
    '4ba0294d-ab7e-4806-8cb7-4787eb23e712.jpg',
    'bb06e7a6-85ae-44d3-bdc9-cb395a7e520c.jpg',
    'fd7d254e-a5f0-450c-9a94-ec3fd9a4a706.jpg'
  ],
  'combination2': [
    '8e8ba0bc-75fc-4b75-b922-bfa3a43096b8.jpg',
    'bb06e7a6-85ae-44d3-bdc9-cb395a7e520c.jpg',
    'fd7d254e-a5f0-450c-9a94-ec3fd9a4a706.jpg'
  ]
};

/**
 * Detects which combination a selected item belongs to
 */
export function detectCombination(selectedItems: any[]): string | null {
  console.log('Detecting combination for selected items:', selectedItems);
  
  for (const item of selectedItems) {
    // Extract filename from image URL
    const imageUrl = item.image || '';
    const filename = imageUrl.split('/').pop() || '';
    
    console.log(`Checking item ${item.id} with image: ${imageUrl}, filename: ${filename}`);
    
    // Check if filename matches any combination
    for (const [combinationName, filenames] of Object.entries(COMBINATION_MAPPINGS)) {
      if (filenames.includes(filename)) {
        console.log(`Found match for ${filename} in ${combinationName}`);
        return combinationName;
      }
    }
  }
  console.log('No combination match found');
  return null;
}

/**
 * Gets all items for a specific combination
 */
export function getCombinationItems(combinationName: string): CombinationItem[] {
  const filenames = COMBINATION_MAPPINGS[combinationName as keyof typeof COMBINATION_MAPPINGS];
  if (!filenames) return [];

  return filenames.map((filename, index) => {
    // Extract category from filename or use default
    let category = 'accessories';
    if (filename.includes('3b30b0c5') || filename.includes('4ba0294d')) {
      category = 'tops';
    } else if (filename.includes('bb06e7a6')) {
      category = 'bottoms';
    } else if (filename.includes('fd7d254e')) {
      category = 'shoes';
    } else if (filename.includes('8e8ba0bc')) {
      category = 'dresses';
    }

    const imagePath = `/images/combinations/${combinationName.replace('combination', 'combination ')}/${filename}`;
    console.log(`Creating item for ${combinationName}:`, {
      filename,
      category,
      imagePath
    });
    
    return {
      id: `hardcoded-${combinationName}-${index}`,
      name: `${category.charAt(0).toUpperCase() + category.slice(1)} Item`,
      image: imagePath,
      category,
      isOwned: true
    };
  });
}

/**
 * Creates a hardcoded outfit based on combination
 */
export function createHardcodedOutfit(combinationName: string): HardcodedOutfit {
  const items = getCombinationItems(combinationName);
  
  return {
    id: `hardcoded-outfit-${combinationName}`,
    title: `Curated Look`,
    caption: '',
    items,
    type: 'hardcoded-combination',
    score: 0.98,
    styling_tips: []
  };
}
