import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fileService } from "@/services/fileservices";
import { authService } from "@/services/authservices";
import {
  ArrowLeft,
  Download,
  Share,
  Trash2,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Hash,
  Calendar,
  User,
  Eye,
  Lock,
  Copy,
  Users,
  CheckCircle
} from "lucide-react";

function FileDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareWithUsers, setShareWithUsers] = useState("");
  const [copied, setCopied] = useState(false);

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

  // Load file details
  useEffect(() => {
    const loadFileDetails = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const fileData = await fileService.getFileDetails(id);
        setFile(fileData);
      } catch (err) {
        console.error("Failed to load file details:", err);
        setError(err.response?.data?.error || "Failed to load file details");
      } finally {
        setLoading(false);
      }
    };

    loadFileDetails();
  }, [id]);

  // Handle download
  const handleDownload = async () => {
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

  // Handle delete
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      await fileService.deleteFile(file.id);
      navigate("/files");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Delete failed. Please try again.");
    }
  };

  // Handle share toggle (public/private)
  const handleShareToggle = async (isPublic) => {
    try {
      setShareLoading(true);
      const result = await fileService.shareFile(file.id, isPublic);
      setFile(prev => ({ ...prev, is_public: result.is_public }));

      if (result.is_public && result.share_token) {
        // Generate share URL for public files
        const shareUrl = `${window.location.origin}/share/${result.share_token}`;
        setShareUrl(shareUrl);
        setShareDialogOpen(true);
      }
    } catch (error) {
      console.error("Share update failed:", error);
      alert("Failed to update sharing settings.");
    } finally {
      setShareLoading(false);
    }
  };

  // Handle copy share link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      alert("Failed to copy link to clipboard");
    }
  };

  // Handle share with specific users (placeholder)
  const handleShareWithUsers = async () => {
    if (!shareWithUsers.trim()) return;

    try {
      setShareLoading(true);
      // TODO: Implement share with specific users endpoint
      alert(`Sharing with users: ${shareWithUsers} (placeholder - endpoint not implemented yet)`);
      setShareWithUsers("");
    } catch (error) {
      console.error("Share with users failed:", error);
      alert("Failed to share with users.");
    } finally {
      setShareLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Loading file details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-destructive mb-4">Error: {error}</div>
        <Button onClick={() => navigate("/files")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Files
        </Button>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">File not found</div>
        <Button onClick={() => navigate("/files")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Files
        </Button>
      </div>
    );
  }

  const IconComponent = getFileIcon(file.mime_type);
  const isOwner = currentUser && file.user_id === currentUser.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/files")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Files
        </Button>
      </div>

      {/* File Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <IconComponent className="h-12 w-12 text-muted-foreground" />
              <div>
                <CardTitle className="text-2xl">{file.name}</CardTitle>
                <CardDescription className="text-base">
                  {formatFileSize(file.size)} • {file.mime_type || 'Unknown type'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {file.is_public ? (
                <Badge variant="secondary">
                  <Eye className="mr-1 h-3 w-3" />
                  Public
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Lock className="mr-1 h-3 w-3" />
                  Private
                </Badge>
              )}
              {file.share_token && (
                <Badge variant="outline">
                  <Share className="mr-1 h-3 w-3" />
                  Shared
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            {isOwner && (
              <>
                <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => handleShareToggle(!file.is_public)}
                      disabled={shareLoading}
                    >
                      <Share className="mr-2 h-4 w-4" />
                      {file.is_public ? 'Make Private' : 'Make Public'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>File Sharing</DialogTitle>
                      <DialogDescription>
                        {file.is_public
                          ? "This file is now publicly accessible. Anyone with the link can view it."
                          : "This file is now private and only accessible to you."
                        }
                      </DialogDescription>
                    </DialogHeader>
                    {file.is_public && shareUrl && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="share-url">Share Link</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="share-url"
                              value={shareUrl}
                              readOnly
                              className="flex-1"
                            />
                            <Button onClick={handleCopyLink} variant="outline">
                              {copied ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="share-users">Share with specific users (email addresses)</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="share-users"
                              placeholder="user1@example.com, user2@example.com"
                              value={shareWithUsers}
                              onChange={(e) => setShareWithUsers(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              onClick={handleShareWithUsers}
                              disabled={shareLoading || !shareWithUsers.trim()}
                              variant="outline"
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Enter email addresses separated by commas
                          </p>
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <Button onClick={() => setShareDialogOpen(false)}>
                        Done
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Filename</p>
                <p className="text-sm text-muted-foreground">{file.name}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center space-x-3">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">SHA-256 Hash</p>
                <p className="text-xs font-mono text-muted-foreground break-all">
                  {file.sha256_hash || 'Not available'}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Upload Date</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(file.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Uploader</p>
                <p className="text-sm text-muted-foreground">
                  {isOwner ? 'You' : 'Other user'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deduplication & Stats */}
        <Card>
          <CardHeader>
            <CardTitle>File Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Deduplication Status</p>
              <Badge variant="secondary">
                {file.sha256_hash ? 'Deduplicated' : 'Original'}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                {file.sha256_hash
                  ? 'This file has been deduplicated to save storage space.'
                  : 'This is the original copy of this file.'
                }
              </p>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium mb-2">Download Count</p>
              <p className="text-2xl font-bold">
                {/* TODO: Add download count from backend */}
                0
              </p>
              <p className="text-xs text-muted-foreground">
                Times downloaded
              </p>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium mb-2">Deduplication References</p>
              <p className="text-2xl font-bold">
                {/* TODO: Add deduplication reference count from backend */}
                1
              </p>
              <p className="text-xs text-muted-foreground">
                Files pointing to this content
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FileDetailsPage;
