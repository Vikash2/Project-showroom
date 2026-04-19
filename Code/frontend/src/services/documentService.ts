import api from './api';

/**
 * Upload document to backend storage
 */
export async function uploadDocument(
  entityId: string,
  documentType: string,
  file: File,
  entityType: 'booking' | 'sale' = 'booking'
): Promise<{
  success: boolean;
  url?: string;
  error?: { code: string; message: string };
}> {
  try {
    console.log('[documentService] Uploading document:', {
      entityId,
      entityType,
      documentType,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append(entityType === 'booking' ? 'bookingId' : 'saleId', entityId);
    formData.append('documentType', documentType);

    // Upload to backend
    const response = await api.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('[documentService] Upload response:', response.data);

    return {
      success: true,
      url: response.data.url,
    };
  } catch (error: any) {
    console.error('[documentService] Upload error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'UPLOAD_ERROR',
        message: error.response?.data?.error || error.message || 'Failed to upload document',
      },
    };
  }
}

/**
 * Delete document from backend storage
 */
export async function deleteDocument(
  entityId: string,
  documentType: string,
  entityType: 'booking' | 'sale' = 'booking'
): Promise<{
  success: boolean;
  error?: { code: string; message: string };
}> {
  try {
    console.log('[documentService] Deleting document:', {
      entityId,
      entityType,
      documentType,
    });

    await api.delete(`/api/documents/${entityId}/${documentType}?type=${entityType}`);

    console.log('[documentService] Document deleted successfully');

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('[documentService] Delete error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'DELETE_ERROR',
        message: error.response?.data?.error || error.message || 'Failed to delete document',
      },
    };
  }
}

/**
 * Get document URL
 */
export async function getDocumentUrl(
  entityId: string,
  documentType: string,
  entityType: 'booking' | 'sale' = 'booking'
): Promise<{
  success: boolean;
  url?: string;
  error?: { code: string; message: string };
}> {
  try {
    const response = await api.get(`/api/documents/${entityId}/${documentType}?type=${entityType}`);

    return {
      success: true,
      url: response.data.url,
    };
  } catch (error: any) {
    console.error('[documentService] Get URL error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'GET_URL_ERROR',
        message: error.response?.data?.error || error.message || 'Failed to get document URL',
      },
    };
  }
}
