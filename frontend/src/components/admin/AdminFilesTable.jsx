import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fileService } from "@/services/fileservices";
import {
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Eye,
  Download,
  Trash2,
  Search,
  Filter,
  MoreHorizontal
} from "lucide-react";

function AdminFilesTable() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Mock data for admin files view
  const mockFiles = [
    {
      id: "1",
      name: "annual-report.pdf",
      size: 2457600,
      mime_type: "application/pdf",
      user_id: "user1",
      user_email: "john@example.com",
      is_public: true,
      created_at: "2024-01-15T10:30:00Z",
      downloads: 45,
    },
    {
      id: "2",
      name: "presentation.pptx",
      size: 5120000,
      mime_type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      user_id: "user2",
      user_email: "jane@example.com",
      is_public: false,
      created_at: "2024-01-14T14:20:00Z",
      downloads: 12,
    },
    {
      id: "3",
      name: "screenshot.png",
      size: 1024000,
      mime_type: "image/png",
      user_id: "user1",
      user_email: "john@example.com",
      is_public: true,
      created_at: "2024-01-13T09:15:00Z",
      downloads: 89,
    },
    {
      id: "4",
      name: "video-tutorial.mp4",
      size: 52428800,
      mime_type: "video/mp4",
      user_id: "user3",
      user_email: "admin@example.com",
      is_public: true,
      created_at: "2024-01-12T16:45:00Z",
      downloads: 156,
    },
  ];

  useEffect(() => {
    const loadAdminFiles = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual admin files API
        // const response = await fileService.getAdminFiles();

        // Filter mock data based on search and filters
        let filteredFiles = mockFiles;

        if (search) {
          filteredFiles = filteredFiles.filter(file =>
            file.name.toLowerCase().includes(search.toLowerCase()) ||
            file.user_email.toLowerCase().includes(search.toLowerCase())
          );
        }

        if (userFilter) {
          filteredFiles = filteredFiles.filter(file => file.user_email === userFilter);
        }

        if (typeFilter) {
          if (typeFilter === "image") {
            filteredFiles = filteredFiles.filter(file => file.mime_type.startsWith("image/"));
          } else if (typeFilter === "video") {
            filteredFiles = filteredFiles.filter(file => file.mime_type.startsWith("video/"));
          } else if (typeFilter === "document") {
            filteredFiles = filteredFiles.filter(file =>
              file.mime_type.includes("pdf") ||
              file.mime_type.includes("document") ||
              file.mime_type.includes("text")
            );
          }
        }

        setFiles(filteredFiles);
        setTotalPages(Math.ceil(filteredFiles.length / 20)); // Assuming 20 per page
      } catch (error) {
        console.error("Failed to load admin files:", error);
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };

    loadAdminFiles();
  }, [search, userFilter, typeFilter, currentPage]);

  // Get file icon
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

  // Handle admin actions
  const handleDownload = async (file) => {
    try {
      // Admin can download any file
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
      alert("Download failed");
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm("Are you sure you want to delete this file? This action cannot be undone.")) return;

    try {
      await fileService.deleteFile(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Delete failed");
    }
  };

  // Get unique users for filter
  const uniqueUsers = [...new Set(mockFiles.map(f => f.user_email))];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded animate-pulse w-1/4"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-1/6"></div>
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
        <CardTitle>All Files (Admin View)</CardTitle>
        <CardDescription>
          Manage files across all users in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search files or users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All users</SelectItem>
              {uniqueUsers.map(user => (
                <SelectItem key={user} value={user}>{user}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Files Table */}
        <div className="space-y-4">
          {files.length > 0 ? (
            files.map((file) => {
              const IconComponent = getFileIcon(file.mime_type);

              return (
                <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <IconComponent className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{file.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{file.user_email}</span>
                        <span>•</span>
                        <span>{new Date(file.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{file.downloads} downloads</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {file.is_public && (
                      <Badge variant="secondary">
                        <Eye className="h-3 w-3 mr-1" />
                        Public
                      </Badge>
                    )}

                    <Button variant="ghost" size="sm" onClick={() => handleDownload(file)}>
                      <Download className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No files found</h3>
              <p className="text-muted-foreground">
                {search || userFilter || typeFilter
                  ? "Try adjusting your filters."
                  : "No files have been uploaded yet."
                }
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {files.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AdminFilesTable;


