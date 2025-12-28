import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fileService } from "@/services/fileservices";
import { generateSHA256 } from "@/lib/sha256";
import {
  Upload,
  X,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

function FileUpload({ onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [isPublic, setIsPublic] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadResults, setUploadResults] = useState([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [duplicateDialog, setDuplicateDialog] = useState(null); // { file, duplicateInfo, confirmed }
  const fileInputRef = useRef(null);

  // MIME type to icon mapping
  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Video;
    if (mimeType.startsWith('audio/')) return Music;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return Archive;
    return FileText;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validate file extension vs MIME type (best effort)
  const validateFileType = (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    const mimeType = file.type.toLowerCase();

    const mimeToExt = {
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'image/gif': ['gif'],
      'image/webp': ['webp'],
      'application/pdf': ['pdf'],
      'text/plain': ['txt'],
      'application/msword': ['doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
      'application/vnd.ms-excel': ['xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
      'application/zip': ['zip'],
      'application/x-rar-compressed': ['rar'],
      'video/mp4': ['mp4'],
      'video/quicktime': ['mov'],
      'audio/mpeg': ['mp3'],
      'audio/wav': ['wav'],
    };

    if (mimeToExt[mimeType] && !mimeToExt[mimeType].includes(extension)) {
      return `File extension (.${extension}) doesn't match MIME type (${mimeType}). This might be a renamed file.`;
    }

    return null;
  };

  // Handle file selection with duplicate checking
  const handleFiles = useCallback(async (selectedFiles) => {
    setCheckingDuplicates(true);

    const newFiles = [];
    for (const file of Array.from(selectedFiles)) {
      const validationError = validateFileType(file);

      // Generate SHA hash
      let sha256Hash;
      let isDuplicate = false;
      let duplicateInfo = null;

      try {
        sha256Hash = await generateSHA256(file);

        // Check for duplicates
        const duplicateCheck = await fileService.checkDuplicate(sha256Hash);
        isDuplicate = duplicateCheck.is_duplicate;
        duplicateInfo = duplicateCheck.duplicate_info;
      } catch (error) {
        console.error('Error checking for duplicates:', error);
        // Continue without duplicate checking if API fails
      }

      const fileData = {
        file,
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        sha256Hash,
        isDuplicate,
        duplicateInfo,
        validationError,
        confirmedDuplicate: false, // Track if user confirmed upload despite duplicate
      };

      // If duplicate found, show confirmation dialog
      if (isDuplicate && !fileData.confirmedDuplicate) {
        setDuplicateDialog({ file: fileData, duplicateInfo });
        setCheckingDuplicates(false);
        return; // Don't add file until user confirms
      }

      newFiles.push(fileData);
    }

    setFiles(prev => [...prev, ...newFiles]);
    setCheckingDuplicates(false);
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Remove file from list
  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  // Handle duplicate confirmation
  const handleDuplicateConfirm = () => {
    if (duplicateDialog) {
      const confirmedFile = {
        ...duplicateDialog.file,
        confirmedDuplicate: true,
      };
      setFiles(prev => [...prev, confirmedFile]);
      setDuplicateDialog(null);
    }
  };

  // Handle duplicate rejection
  const handleDuplicateReject = () => {
    setDuplicateDialog(null);
  };

  // Upload files
  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadResults([]);

    // Prepare files for upload
    const filesToUpload = files.map(f => ({
      file: f.file,
      name: f.name,
      isPublic,
    }));

    try {
      const results = await fileService.uploadFiles(filesToUpload);
      setUploadResults(results);

      // Clear successfully uploaded files
      const successfulUploads = results.filter(r => r.success);
      if (successfulUploads.length > 0) {
        setFiles(prev => prev.filter(f =>
          !successfulUploads.some(r => r.file === f.file)
        ));
      }

      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete(results);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadResults([{
        success: false,
        error: 'Upload failed',
        file: null,
      }]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="card card-hover">
        <div className="p-8">
          {/* File Upload Zone */}
          <section className="mb-8">
            <div
              className="group relative border-2 border-dashed border-primary/30 rounded-xl p-12 text-center transition-all duration-300 cursor-pointer hover:border-primary/60 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 scale-in"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload files by dragging and dropping or clicking to browse"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Upload className="mx-auto h-16 w-16 text-primary/60 mb-6 group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
              <h3 className="text-2xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                Drop files here or click to browse
              </h3>
              <p className="text-muted-foreground mb-6 text-lg">
                Support for images, documents, videos, and archives up to 100MB
              </p>
              <Button
                variant="default"
                size="lg"
                type="button"
                className="btn-primary"
              >
                Choose Files
              </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
              aria-label="Select files to upload"
            />
          </div>

          {/* Duplicate Check Status */}
          {checkingDuplicates && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Checking for duplicate files...</span>
              </div>
            </div>
          )}

          {/* Sharing Options */}
          <div className="flex items-center justify-between mt-6 p-4 bg-secondary/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="is-public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label
                htmlFor="is-public"
                className="text-sm font-medium cursor-pointer"
              >
                Make uploaded files publicly accessible
              </Label>
            </div>
            <Badge variant={isPublic ? "default" : "secondary"} className="text-xs">
              {isPublic ? "Public" : "Private"}
            </Badge>
          </div>
          </section>
        </div>
      </div>

      {/* Selected Files Preview */}
      {files.length > 0 && (
        <div className="card card-hover">
          <div className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">Ready to Upload ({files.length})</h4>
                <Badge variant="outline" className="text-sm">
                  {formatFileSize(files.reduce((total, file) => total + file.size, 0))} total
                </Badge>
              </div>

              {files.map((fileData) => {
                const IconComponent = getFileIcon(fileData.type);
                const progress = uploadProgress[fileData.id] || 0;

                return (
                  <div key={fileData.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <IconComponent className="h-8 w-8 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{fileData.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(fileData.size)}
                        </p>
                        {fileData.validationError && (
                          <p className="text-sm text-destructive flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {fileData.validationError}
                          </p>
                        )}
                        {fileData.isDuplicate && fileData.confirmedDuplicate && (
                          <p className="text-sm text-amber-600 flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Duplicate content - will create new reference
                          </p>
                        )}
                        {progress > 0 && progress < 100 && (
                          <div className="mt-2">
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">{progress}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(fileData.id)}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}

              <Button
                onClick={handleUpload}
                disabled={uploading || files.length === 0}
                className="btn-primary w-full py-3"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload {files.length} File{files.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Status & Results */}
      {uploadResults.length > 0 && (
        <div className="card card-hover">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold">Upload Results</h4>
              <Badge variant="outline" className="text-sm">
                {uploadResults.filter(r => r.success).length} of {uploadResults.length} successful
              </Badge>
            </div>
            <div className="space-y-4">
              {uploadResults.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-4 p-4 border rounded-lg transition-all duration-300 ${
                    result.success
                      ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20'
                      : 'border-destructive/20 bg-destructive/5'
                  } animate-in slide-in-from-left-2 duration-500`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {result.success ? (
                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-destructive mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {result.file?.name || 'Unknown file'}
                    </p>
                    {result.success ? (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">
                          Successfully uploaded and processed
                        </p>
                        {result.data?.deduplication_status && (
                          <Badge
                            variant="secondary"
                            className="mt-2 text-xs bg-primary/10 text-primary hover:bg-primary/20"
                          >
                            {result.data.deduplication_status}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-destructive mt-2">
                        {result.error}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Duplicate File Warning Dialog */}
      <Dialog open={!!duplicateDialog} onOpenChange={() => setDuplicateDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Duplicate File Detected
            </DialogTitle>
            <DialogDescription>
              A file with identical content has already been uploaded to the system.
            </DialogDescription>
          </DialogHeader>

          {duplicateDialog && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{duplicateDialog.file.name}</strong> ({formatFileSize(duplicateDialog.file.size)})
                  appears to be a duplicate of existing content.
                </AlertDescription>
              </Alert>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Duplicate Information:</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p><strong>File Size:</strong> {formatFileSize(duplicateDialog.duplicateInfo?.file_size || 0)}</p>
                  <p><strong>Uploaded:</strong> {duplicateDialog.duplicateInfo?.uploaded_at ?
                    new Date(duplicateDialog.duplicateInfo.uploaded_at).toLocaleString() : 'Unknown'}</p>
                  <p><strong>References:</strong> {duplicateDialog.duplicateInfo?.reference_count || 0} file(s) point to this content</p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p><strong>Note:</strong> Uploading this file will create another reference to the same content,
                helping with organization while saving storage space.</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleDuplicateReject}>
              Cancel Upload
            </Button>
            <Button onClick={handleDuplicateConfirm}>
              Upload Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FileUpload;
