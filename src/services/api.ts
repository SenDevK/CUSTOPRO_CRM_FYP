/**
 * API service for communicating with the backend
 */

// Using Vite's proxy feature to avoid CORS issues in development
const API_BASE_URL = '/api';

/**
 * Interface for column mapping response
 */
export interface ColumnMappingResponse {
  headers: string[];
  suggested_mappings: Record<string, string | null>;
  available_fields: string[];
}

/**
 * Interface for file upload response
 */
export interface FileUploadResponse {
  processed: number;
  failed: number;
  errors: string[];
}

/**
 * Detect columns in a file and get suggested mappings
 * @param file The file to analyze
 * @returns Promise with the column detection results
 */
export const detectFileColumns = async (file: File): Promise<ColumnMappingResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/detect-columns`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to detect columns');
    }

    return await response.json();
  } catch (error) {
    console.error('Error detecting columns:', error);
    throw error;
  }
};

/**
 * Upload and validate a file with optional column mappings
 * @param file The file to upload
 * @param mappings Optional custom column mappings
 * @returns Promise with the validation results
 */
export const uploadAndValidateFile = async (
  file: File,
  mappings?: Record<string, string>
): Promise<FileUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    // Add mappings if provided
    if (mappings) {
      formData.append('mappings', JSON.stringify(mappings));
    }

    const response = await fetch(`${API_BASE_URL}/upload-data`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload file');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
