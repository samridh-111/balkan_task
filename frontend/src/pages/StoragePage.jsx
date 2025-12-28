import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
// Alert component not available, using simple div
import {
  HardDrive,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  Download,
  Trash2,
  FileText,
  Image,
  Video,
  Archive
} from "lucide-react";

function StoragePage() {
  const [storageData] = useState({
    used: 2.3 * 1024 * 1024 * 1024, // 2.3 GB in bytes
    total: 10 * 1024 * 1024 * 1024, // 10 GB in bytes
    files: 42,
    byType: {
      documents: { count: 15, size: 512 * 1024 * 1024 }, // 512 MB
      images: { count: 12, size: 800 * 1024 * 1024 }, // 800 MB
      videos: { count: 8, size: 1.2 * 1024 * 1024 * 1024 }, // 1.2 GB
      archives: { count: 7, size: 256 * 1024 * 1024 }, // 256 MB
    },
    largestFiles: [
      { name: "annual-report.pdf", size: 2457600, type: "document" },
      { name: "presentation.pptx", size: 5120000, type: "document" },
      { name: "screenshot.png", size: 1024000, type: "image" },
      { name: "tutorial.mp4", size: 157286400, type: "video" },
      { name: "backup.zip", size: 524288000, type: "archive" },
    ]
  });

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStoragePercentage = () => {
    return (storageData.used / storageData.total) * 100;
  };

  const getStorageColor = () => {
    const percentage = getStoragePercentage();
    if (percentage >= 90) return "destructive";
    if (percentage >= 70) return "warning";
    return "default";
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'document': return FileText;
      case 'image': return Image;
      case 'video': return Video;
      case 'archive': return Archive;
      default: return FileText;
    }
  };

  return (
    <div className="storage-page">
      {/* Page Header */}
      <header className="storage-header">
        <div className="header-content">
          <h1 className="storage-title">Storage Management</h1>
          <p className="storage-subtitle">
            Monitor and manage your storage usage and file organization.
          </p>
        </div>
      </header>

      {/* Storage Overview */}
      <div className="storage-overview">
        <Card className="storage-card">
          <CardHeader>
            <CardTitle className="card-title">
              <HardDrive className="title-icon" />
              Storage Overview
            </CardTitle>
            <CardDescription>
              Your current storage usage and limits.
            </CardDescription>
          </CardHeader>
          <CardContent className="card-content">
            <div className="storage-stats">
              <div className="storage-meter">
                <div className="storage-info">
                  <span className="storage-used">{formatBytes(storageData.used)}</span>
                  <span className="storage-separator">of</span>
                  <span className="storage-total">{formatBytes(storageData.total)}</span>
                </div>
                <Progress
                  value={getStoragePercentage()}
                  className="storage-progress"
                />
                <div className="storage-percentage">
                  {getStoragePercentage().toFixed(1)}% used
                </div>
              </div>

              {getStoragePercentage() > 80 && (
                <div className="storage-alert">
                  <AlertTriangle className="alert-icon" />
                  <p className="alert-description">
                    You're running low on storage space. Consider deleting unused files or upgrading your plan.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Storage by Type */}
        <Card className="storage-card">
          <CardHeader>
            <CardTitle className="card-title">
              <FileText className="title-icon" />
              Storage by File Type
            </CardTitle>
            <CardDescription>
              Breakdown of your storage usage by file category.
            </CardDescription>
          </CardHeader>
          <CardContent className="card-content">
            <div className="file-type-breakdown">
              {Object.entries(storageData.byType).map(([type, data]) => {
                const Icon = getFileIcon(type);
                const percentage = (data.size / storageData.used) * 100;

                return (
                  <div key={type} className="file-type-item">
                    <div className="file-type-info">
                      <Icon className="file-type-icon" />
                      <div className="file-type-details">
                        <span className="file-type-name">{type.charAt(0).toUpperCase() + type.slice(1)}s</span>
                        <span className="file-type-count">{data.count} files</span>
                      </div>
                    </div>
                    <div className="file-type-stats">
                      <span className="file-type-size">{formatBytes(data.size)}</span>
                      <span className="file-type-percentage">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Largest Files */}
      <Card className="storage-card">
        <CardHeader>
          <CardTitle className="card-title">
            <TrendingUp className="title-icon" />
            Largest Files
          </CardTitle>
          <CardDescription>
            Your biggest files taking up the most storage space.
          </CardDescription>
        </CardHeader>
        <CardContent className="card-content">
          <div className="largest-files">
            {storageData.largestFiles.map((file, index) => {
              const Icon = getFileIcon(file.type);
              return (
                <div key={index} className="file-item">
                  <div className="file-info">
                    <Icon className="file-icon" />
                    <div className="file-details">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{formatBytes(file.size)}</span>
                    </div>
                  </div>
                  <div className="file-actions">
                    <Button variant="ghost" size="sm" className="download-button">
                      <Download className="action-icon" />
                    </Button>
                    <Button variant="ghost" size="sm" className="delete-button">
                      <Trash2 className="action-icon" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Storage Tips */}
      <Card className="storage-card">
        <CardHeader>
          <CardTitle className="card-title">
            <Info className="title-icon" />
            Storage Tips
          </CardTitle>
          <CardDescription>
            Ways to optimize your storage usage.
          </CardDescription>
        </CardHeader>
        <CardContent className="card-content">
          <div className="storage-tips">
            <div className="tip-item">
              <TrendingDown className="tip-icon" />
              <div className="tip-content">
                <h4 className="tip-title">Delete Unused Files</h4>
                <p className="tip-description">
                  Regularly review and remove files you no longer need to free up space.
                </p>
              </div>
            </div>

            <div className="tip-item">
              <Archive className="tip-icon" />
              <div className="tip-content">
                <h4 className="tip-title">Compress Large Files</h4>
                <p className="tip-description">
                  Use compression for large documents and archives to save space.
                </p>
              </div>
            </div>

            <div className="tip-item">
              <FileText className="tip-icon" />
              <div className="tip-content">
                <h4 className="tip-title">Use Cloud Storage</h4>
                <p className="tip-description">
                  Consider moving large, infrequently accessed files to external storage.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StoragePage;
