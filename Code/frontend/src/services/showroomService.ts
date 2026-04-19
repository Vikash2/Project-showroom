import { apiClient } from './apiClient';

export interface ShowroomResponse {
  id: string;
  name: string;
  location: string;
  address: string;
  contactNumber: string;
  email: string;
  managerName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * List all showrooms
 */
export async function listShowrooms(filters?: {
  isActive?: boolean;
}): Promise<{ success: boolean; showrooms?: ShowroomResponse[]; error?: any }> {
  try {
    console.log('[showroomService] Listing showrooms with filters:', filters);
    
    const params = new URLSearchParams();
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));

    const queryString = params.toString();
    const url = `/api/showrooms${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    console.log('[showroomService] Showrooms loaded:', response.data);
    
    return {
      success: true,
      showrooms: response.data.showrooms,
    };
  } catch (error: any) {
    console.error('[showroomService] Error listing showrooms:', error);
    return {
      success: false,
      error: error.response?.data || { message: error.message },
    };
  }
}

/**
 * Get a single showroom
 */
export async function getShowroom(showroomId: string): Promise<{ success: boolean; showroom?: ShowroomResponse; error?: any }> {
  try {
    console.log('[showroomService] Getting showroom:', showroomId);
    
    const response = await apiClient.get(`/api/showrooms/${showroomId}`);
    console.log('[showroomService] Showroom loaded:', response.data);
    
    return {
      success: true,
      showroom: response.data.showroom,
    };
  } catch (error: any) {
    console.error('[showroomService] Error getting showroom:', error);
    return {
      success: false,
      error: error.response?.data || { message: error.message },
    };
  }
}
