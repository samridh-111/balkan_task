import api from './api';

/**
 * File service for managing file operations with the Balkan API.
 *
 * This service provides methods for uploading, downloading, listing, and managing files
 * with advanced deduplication support. All methods require authentication and handle
 * API errors appropriately.
 *
 * @namespace fileService
 */
export const fileService = {
  /**
   * Check if a file with the given SHA-256 hash already exists in the system.
   *
   * This endpoint enables pre-upload duplicate detection, allowing the frontend
   * to warn users before uploading files that already exist, saving bandwidth
   * and storage space.
   *
   * @param {string} sha256Hash - The SHA-256 hash of the file content (64 characters)
   * @returns {Promise<Object>} Response containing duplicate status and info
   * @returns {boolean} return.is_duplicate - Whether a duplicate exists
   * @returns {Object} [return.duplicate_info] - Info about existing file (if duplicate)
   * @returns {number} return.duplicate_info.file_size - Size of existing file in bytes
   * @returns {string} return.duplicate_info.uploaded_at - ISO timestamp of original upload
   * @returns {number} return.duplicate_info.reference_count - Number of files referencing content
   *
   * @example
   * const hash = await generateSHA256(file);
   * const result = await fileService.checkDuplicate(hash);
   * if (result.is_duplicate) {
   *   console.log(`Duplicate found: ${result.duplicate_info.file_size} bytes`);
   * }
   *
   * @throws {Error} When API request fails or user is not authenticated
   */
  checkDuplicate: async (sha256Hash) => {
    const response = await api.post('/files/check-duplicate', {
      sha256_hash: sha256Hash,
    });
    return response.data;
  },

  /**
   * Upload multiple files with automatic deduplication.
   *
   * This method handles batch file uploads with intelligent deduplication.
   * Files are uploaded one by one, and the backend automatically detects
   * and handles duplicate content using SHA-256 hashing.
   *
   * @param {Array<Object>} files - Array of file objects to upload
   * @param {File} files[].file - The actual File object
   * @param {string} [files[].name] - Optional custom filename (defaults to file.name)
   * @param {boolean} [files[].isPublic] - Whether file should be publicly accessible
   * @returns {Promise<Array<Object>>} Array of upload results
   * @returns {boolean} return[].success - Whether upload succeeded
   * @returns {Object} [return[].data] - File data if successful
   * @returns {string} [return[].error] - Error message if failed
   * @returns {File} return[].file - Original file object
   *
   * @example
   * const files = [
   *   { file: fileInput.files[0], isPublic: false },
   *   { file: fileInput.files[1], name: 'custom-name.pdf', isPublic: true }
   * ];
   * const results = await fileService.uploadFiles(files);
   * const successful = results.filter(r => r.success);
   * console.log(`Uploaded ${successful.length}/${results.length} files`);
   *
   * @throws {Error} When network request fails or authentication is invalid
   */
  uploadFiles: async (files) => {
    const results = [];
    for (const fileData of files) {
      try {
        const formData = new FormData();
        formData.append('file', fileData.file);
        formData.append('name', fileData.name || fileData.file.name);
        formData.append('is_public', fileData.isPublic?.toString() || 'false');

        const response = await api.post('/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        results.push({
          success: true,
          data: response.data,
          file: fileData.file,
        });
      } catch (error) {
        results.push({
          success: false,
          error: error.response?.data?.error || error.message,
          file: fileData.file,
        });
      }
    }
    return results;
  },

  // List files with filters
  listFiles: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.mime_type) queryParams.append('mime_type', params.mime_type);
    if (params.is_public !== undefined) queryParams.append('is_public', params.is_public);
    if (params.page) queryParams.append('page', params.page);
    if (params.page_size) queryParams.append('page_size', params.page_size);

    const response = await api.get(`/files?${queryParams.toString()}`);
    return response.data;
  },

  // Get file details (alias for getFile)
  getFileDetails: async (id) => {
    const response = await api.get(`/files/${id}`);
    return response.data;
  },

  // Download file
  downloadFile: async (id) => {
    const response = await api.get(`/files/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Delete file
  deleteFile: async (id) => {
    const response = await api.delete(`/files/${id}`);
    return response.data;
  },

  // Share file
  shareFile: async (id, isPublic, expiresAt = null) => {
    const response = await api.post(`/files/${id}/share`, {
      is_public: isPublic,
      expires_at: expiresAt,
    });
    return response.data;
  },

  // Get stats (mock data for now - admin endpoint not accessible to regular users)
  getStats: async () => {
    // For now, return mock data since admin endpoints require admin role
    // TODO: Implement proper stats endpoint accessible to all users
    return {
      totalFiles: 42,
      totalUsers: 156,
      totalStorage: 2340000000, // 2.34 GB
      recentUploads: [
        {
          id: "1",
          name: "annual-report.pdf",
          user_email: "john@example.com",
          size: 2457600,
          uploaded_at: "2024-01-15T10:30:00Z",
        },
        {
          id: "2",
          name: "presentation.pptx",
          user_email: "jane@example.com",
          size: 5120000,
          uploaded_at: "2024-01-15T09:15:00Z",
        },
      ],
    };
  },

  // Admin endpoints placeholders
  getAdminFiles: async () => {
    // TODO: Implement admin files endpoint
    try {
      const response = await api.get('/admin/files');
      return response.data;
    } catch (error) {
      return { files: [] };
    }
  },

  getAdminUsers: async () => {
    // TODO: Implement admin users endpoint
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      return { users: [] };
    }
  },
};