import { apiClient } from './apiClient';

export interface AccessoryResponse {
  accessoryId: string;
  name: string;
  category: string;
  description: string;
  price: number;
  showroomId: string | null;
  compatibleVehicles: string[];
  stockQty: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * List all accessories with optional filters
 */
export async function listAccessories(filters?: {
  category?: string;
  vehicleId?: string;
  isActive?: boolean;
  showroomId?: string;
}): Promise<{ success: boolean; accessories?: AccessoryResponse[]; error?: any }> {
  try {
    console.log('[accessoryService] Listing accessories with filters:', filters);
    
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.vehicleId) params.append('vehicleId', filters.vehicleId);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters?.showroomId) params.append('showroomId', filters.showroomId);

    const queryString = params.toString();
    const url = `/api/accessories${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    console.log('[accessoryService] Accessories loaded:', response.data);
    
    return {
      success: true,
      accessories: response.data.accessories,
    };
  } catch (error: any) {
    console.error('[accessoryService] Error listing accessories:', error);
    return {
      success: false,
      error: error.response?.data || { message: error.message },
    };
  }
}

/**
 * Get a single accessory
 */
export async function getAccessory(accessoryId: string): Promise<{ success: boolean; accessory?: AccessoryResponse; error?: any }> {
  try {
    console.log('[accessoryService] Getting accessory:', accessoryId);
    
    const response = await apiClient.get(`/api/accessories/${accessoryId}`);
    console.log('[accessoryService] Accessory loaded:', response.data);
    
    return {
      success: true,
      accessory: response.data.accessory,
    };
  } catch (error: any) {
    console.error('[accessoryService] Error getting accessory:', error);
    return {
      success: false,
      error: error.response?.data || { message: error.message },
    };
  }
}
