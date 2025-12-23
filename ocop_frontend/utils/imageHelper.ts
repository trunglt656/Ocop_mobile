import { API_CONFIG } from '@/constants/api';

/**
 * Converts a relative or absolute image URL to a full URL
 * @param imageUrl - The image URL from the API (can be relative or absolute)
 * @returns Full image URL or placeholder
 */
export const getImageUrl = (imageUrl: string | undefined | null): string => {
  if (!imageUrl) {
    return 'https://via.placeholder.com/400x300?text=No+Image';
  }

  // If it's a base64 data URL (from admin website), return as-is
  if (imageUrl.startsWith('data:image/')) {
    return imageUrl;
  }

  // If already a full URL (starts with http:// or https://), return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If relative URL (starts with /), prepend base URL
  if (imageUrl.startsWith('/')) {
    const baseUrl = API_CONFIG.BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${imageUrl}`;
  }

  // Fallback: assume it's a relative path and prepend base URL
  const baseUrl = API_CONFIG.BASE_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${baseUrl}/${imageUrl}`;
};

/**
 * Get the primary image URL from a product
 * @param images - Array of product images
 * @returns Full URL of the primary image or placeholder
 */
export const getPrimaryImageUrl = (images: Array<{ url: string; isPrimary?: boolean }> | undefined): string => {
  if (!images || images.length === 0) {
    return 'https://via.placeholder.com/400x300?text=No+Image';
  }

  // Find primary image or use first image
  const primaryImage = images.find(img => img.isPrimary) || images[0];
  return getImageUrl(primaryImage.url);
};
