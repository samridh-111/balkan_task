import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fileService } from "@/services/fileservices";
import { authService } from "@/services/authservices";
import {
  Eye,
  Download,
  Trash2,
  FileText,
  Image,
  Video,
  Music,
  Archive
} from "lucide-react";

function FileList({ refreshTrigger, filters = {}, onFiltersChange }) {
  const [files, setFiles] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const currentUser = authService.getCurrentUser();

  // MIME type to icon mapping
  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return Image;
    if (mimeType?.startsWith('video/')) return Video;
    if (mimeType?.startsWith('audio/')) return Music;
    if (mimeType?.includes('zip') || mimeType?.includes('rar') || mimeType?.includes('tar')) return Archive;
    return FileText;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  // Load files
  const loadFiles = async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page || 1,
        page_size: filters.pageSize || 20,
      };

      if (filters.search?.trim()) params.search = filters.search.trim();
      if (filters.mimeType) params.mime_type = filters.mimeType;
      if (filters.isPublic !== undefined && filters.isPublic !== null) {
        params.is_public = filters.isPublic;
      }

      const response = await fileService.listFiles(params);
      setFiles(response.files || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error("Failed to load files:", error);
      setFiles([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [filters, refreshTrigger]);

  // Handle file actions
  const handleViewDetails = (fileId) => {
    navigate(`/files/${fileId}`);
  };

  const handleDownload = async (file) => {
    try {
      const blob = await fileService.downloadFile(file.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      await fileService.deleteFile(fileId);
      loadFiles(); // Refresh the list
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Delete failed. Please try again.");
    }
  };

  // Get deduplication badge
  const getDeduplicationBadge = (file) => {
    // This would come from the backend response
    // For now, just show a placeholder
    if (file.sha256_hash) {
      return <Badge variant="secondary">Deduplicated</Badge>;
    }
    return <Badge variant="outline">Original</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-8 h-8 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>File List</CardTitle>
        <CardDescription>
          Manage and organize your uploaded files
        </CardDescription>
      </CardHeader>
      <CardContent>

        {/* File table */}
        {files.length > 0 ? (
          <div className="space-y-4">
            {/* Desktop table */}
            <div className="hidden md:block">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">File</th>
                      <th className="text-left p-4 font-medium">Size</th>
                      <th className="text-left p-4 font-medium">Uploader</th>
                      <th className="text-left p-4 font-medium">File Type</th>
                      <th className="text-left p-4 font-medium">Upload Date</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((file) => {
                      const IconComponent = getFileIcon(file.mime_type);
                      const isOwner = currentUser && file.user_id === currentUser.id;

                      return (
                        <tr key={file.id} className="border-t hover:bg-muted/50">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <IconComponent className="h-5 w-5 text-muted-foreground" />
                              <span className="font-medium truncate max-w-[200px] sm:max-w-xs lg:max-w-sm">{file.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {formatFileSize(file.size)}
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {isOwner ? 'You' : 'Other'}
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {file.mime_type || 'Unknown'}
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {formatDate(file.created_at)}
                          </td>
                          <td className="p-4">
                            {getDeduplicationBadge(file)}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(file.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(file)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              {isOwner && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(file.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-4">
              {files.map((file) => {
                const IconComponent = getFileIcon(file.mime_type);
                const isOwner = currentUser && file.user_id === currentUser.id;

                return (
                  <div key={file.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium truncate max-w-[200px] sm:max-w-xs lg:max-w-sm">{file.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(file.size)} • {formatDate(file.created_at)}
                          </p>
                        </div>
                      </div>
                      {getDeduplicationBadge(file)}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {file.mime_type || 'Unknown'}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(file.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(file)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {isOwner && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(file.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination info */}
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Showing {files.length} of {total} files • Page {(filters.page || 1)} of {Math.ceil(total / (filters.pageSize || 20)) || 1}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFiltersChange?.({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}
                  disabled={(filters.page || 1) <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFiltersChange?.({ ...filters, page: (filters.page || 1) + 1 })}
                  disabled={files.length < (filters.pageSize || 20)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No files found</h3>
            <p className="text-muted-foreground mb-4">
              {Object.values(filters).some(value =>
                Array.isArray(value) ? value.length > 0 : value !== "" && value !== null
              )
                ? "Try adjusting your filters or search terms."
                : "Upload your first file to get started."
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FileList;
