/**
 * API service for wardrobe operations
 */

const API_BASE_URL = 'http://localhost:5000/api';

export interface WardrobeItem {
  id: number;
  image_url: string;
  category: string;
  created_at?: string;
}

export interface UploadResponse {
  id: number;
  image_url: string;
  category: string;
  created_at: string;
}

export interface ApiError {
  error: string;
}

export interface StylistResponse {
  description: string;
  image_url: string | null;
  warning?: string;
}

/**
 * Upload a new wardrobe item to the backend
 */
export async function uploadWardrobeItem(
  imageFile: File,
  category: string
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('category', category);

  const response = await fetch(`${API_BASE_URL}/wardrobe/upload`, {
    method: 'POST',
    body: formData,
    mode: 'cors', // Explicitly set CORS mode
    credentials: 'omit', // Don't send credentials for CORS
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(errorData.error || 'Failed to upload item');
  }

  return response.json();
}

/**
 * Get all wardrobe items from the backend
 */
export async function getWardrobeItems(): Promise<WardrobeItem[]> {
  const response = await fetch(`${API_BASE_URL}/wardrobe`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'omit',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch wardrobe items');
  }

  return response.json();
}

/**
 * Generate stylist recommendation and reference image
 */
export async function generateStylist(prompt: string): Promise<StylistResponse> {
  const response = await fetch(`${API_BASE_URL}/stylist/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
    mode: 'cors',
    credentials: 'omit',
  });

  if (!response.ok) {
    let errorMsg = 'Failed to generate stylist recommendation';
    try {
      const errorData: ApiError = await response.json();
      if (errorData?.error) errorMsg = errorData.error;
    } catch {}
    throw new Error(errorMsg);
  }

  return response.json();
}

/**
 * Delete a wardrobe item from the backend
 */
export async function deleteWardrobeItem(itemId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/wardrobe/${itemId}`, {
    method: 'DELETE',
    mode: 'cors',
    credentials: 'omit',
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(errorData.error || 'Failed to delete item');
  }
}

/**
 * Check if the backend is healthy
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
    });
    return response.ok;
  } catch {
    return false;
  }
}
