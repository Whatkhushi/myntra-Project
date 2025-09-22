import { getWardrobeItems } from "@/services/wardrobeApi";

export interface ClothingItem {
  id: string;
  image: string;
  category: string;
  name?: string;
  dateAdded: string;
}

/**
 * Loads wardrobe items from both localStorage and backend, merging them without duplicates
 */
export const loadAllWardrobeItems = async (): Promise<ClothingItem[]> => {
  // Load from localStorage first (for legacy items)
  const savedItems = localStorage.getItem("closetItems");
  let localItems: ClothingItem[] = [];
  if (savedItems) {
    localItems = JSON.parse(savedItems);
  }

  // Load from backend (primary storage)
  let backendItems: any[] = [];
  try {
    backendItems = await getWardrobeItems();
  } catch (error) {
    console.log('Backend not available, using localStorage only');
    return localItems; // Return only localStorage items if backend is down
  }

  // Convert backend items to ClothingItem format
  const backendClothingItems: ClothingItem[] = backendItems.map(item => ({
    id: `backend_${item.id}`,
    image: `http://localhost:5000${item.image_url}`,
    category: item.category,
    name: `${item.category} Item`,
    dateAdded: item.created_at || new Date().toISOString(),
  }));

  // If backend is available, use backend items as primary source
  // Only include localStorage items that don't exist in backend
  const allItems = [...backendClothingItems];
  
  // Add localStorage items that don't exist in backend (for legacy support)
  localItems.forEach(localItem => {
    const exists = allItems.some(item => 
      item.image === localItem.image && 
      item.category === localItem.category
    );
    if (!exists) {
      allItems.push(localItem);
    }
  });

  return allItems;
};

/**
 * Gets the total count of wardrobe items from both localStorage and backend
 */
export const getTotalWardrobeCount = async (): Promise<number> => {
  const items = await loadAllWardrobeItems();
  return items.length;
};

/**
 * Gets category counts for wardrobe items
 */
export const getWardrobeCategoryCounts = async (): Promise<{
  tops: number;
  bottoms: number;
  shoes: number;
  accessories: number;
  dresses: number;
}> => {
  const items = await loadAllWardrobeItems();
  
  return {
    tops: items.filter(item => item.category.toLowerCase() === 'tops').length,
    bottoms: items.filter(item => item.category.toLowerCase() === 'bottoms').length,
    shoes: items.filter(item => item.category.toLowerCase() === 'shoes').length,
    accessories: items.filter(item => item.category.toLowerCase() === 'accessories').length,
    dresses: items.filter(item => item.category.toLowerCase() === 'dresses').length
  };
};

/**
 * Clears localStorage duplicates and ensures clean data
 * This should be called when the app starts to clean up any duplicate data
 */
export const clearLocalStorageDuplicates = async (): Promise<void> => {
  try {
    // Get backend items
    const backendItems = await getWardrobeItems();
    
    // Get localStorage items
    const savedItems = localStorage.getItem("closetItems");
    let localItems: ClothingItem[] = [];
    if (savedItems) {
      localItems = JSON.parse(savedItems);
    }

    // Remove localStorage items that exist in backend
    const cleanedLocalItems = localItems.filter(localItem => {
      return !backendItems.some(backendItem => 
        localItem.image.includes(backendItem.image_url) && 
        localItem.category === backendItem.category
      );
    });

    // Update localStorage with cleaned data
    localStorage.setItem("closetItems", JSON.stringify(cleanedLocalItems));
    
    console.log(`Cleaned ${localItems.length - cleanedLocalItems.length} duplicate items from localStorage`);
  } catch (error) {
    console.log('Backend not available, skipping duplicate cleanup');
  }
};
