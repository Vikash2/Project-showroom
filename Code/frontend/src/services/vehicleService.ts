import { apiClient } from './apiClient';

export interface VehicleColor {
  colorId: string;
  colorName: string;
  colorCode: string;
  stockQty: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface VehicleVariant {
  variantId: string;
  variantName: string;
  price: number;
  specifications: Record<string, any>;
  colors: VehicleColor[];
}

export interface VehicleResponse {
  vehicleId: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  basePrice: number;
  showroomId: string | null;
  imageUrl: string | null;
  isActive: boolean;
  variants: VehicleVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface VehicleListItem {
  vehicleId: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  basePrice: number;
  showroomId: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * List all vehicles with optional filters
 */
export async function listVehicles(filters?: {
  category?: string;
  brand?: string;
  isActive?: boolean;
  showroomId?: string;
}): Promise<{ success: boolean; vehicles?: VehicleListItem[]; error?: any }> {
  try {
    console.log('[vehicleService] Listing vehicles with filters:', filters);
    
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.brand) params.append('brand', filters.brand);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters?.showroomId) params.append('showroomId', filters.showroomId);

    const queryString = params.toString();
    const url = `/api/vehicles${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    console.log('[vehicleService] Vehicles loaded:', response.data);
    
    return {
      success: true,
      vehicles: response.data.vehicles,
    };
  } catch (error: any) {
    console.error('[vehicleService] Error listing vehicles:', error);
    return {
      success: false,
      error: error.response?.data || { message: error.message },
    };
  }
}

/**
 * Get a single vehicle with all variants and colors
 */
export async function getVehicle(vehicleId: string): Promise<{ success: boolean; vehicle?: VehicleResponse; error?: any }> {
  try {
    console.log('[vehicleService] Getting vehicle:', vehicleId);
    
    const response = await apiClient.get(`/api/vehicles/${vehicleId}`);
    console.log('[vehicleService] Vehicle loaded:', response.data);
    
    return {
      success: true,
      vehicle: response.data.vehicle,
    };
  } catch (error: any) {
    console.error('[vehicleService] Error getting vehicle:', error);
    return {
      success: false,
      error: error.response?.data || { message: error.message },
    };
  }
}

/**
 * Update stock for a specific color
 */
export async function updateStock(
  vehicleId: string,
  variantId: string,
  colorId: string,
  stockData: { stockQty: number; status?: string }
): Promise<{ success: boolean; vehicle?: VehicleResponse; error?: any }> {
  try {
    console.log('[vehicleService] Updating stock:', { vehicleId, variantId, colorId, stockData });
    
    const response = await apiClient.patch(
      `/api/vehicles/${vehicleId}/variants/${variantId}/stock?colorId=${colorId}`,
      stockData
    );
    
    console.log('[vehicleService] Stock updated:', response.data);
    
    return {
      success: true,
      vehicle: response.data.vehicle,
    };
  } catch (error: any) {
    console.error('[vehicleService] Error updating stock:', error);
    return {
      success: false,
      error: error.response?.data || { message: error.message },
    };
  }
}
