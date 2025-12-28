import api from './api';

export const fileService = {
  // Check if file with given SHA hash already exists
  checkDuplicate: async (sha256Hash) => {
    const response = await api.post('/files/check-duplicate', {
      sha256_hash: sha256Hash,
    });
    return response.data;
  },

  // Upload files (supports multiple files)
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