import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatsCards from "@/components/dashboard/StatsCards";
import { fileService } from "@/services/fileservices";
import { authService } from "@/services/authservices";
import { Upload, FileText, ArrowRight, Download, Eye, Share } from "lucide-react";

function DashboardPage() {
  const navigate = useNavigate();
  const [recentActivities, setRecentActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  // Helper function to format time ago
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return time.toLocaleDateString();
  };

  // Fetch recent activities on component mount
  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        // In a real implementation, this would be a dedicated API endpoint
        // For now, we'll use the files list endpoint and show recent files
        const response = await fileService.listFiles({
          page: 1,
          pageSize: 5,
          sortBy: 'created_at',
          sortOrder: 'desc'
        });

        // Transform files into activities
        const activities = response.files.map(file => ({
          id: file.id,
          type: 'upload',
          title: file.name,
          description: `${file.size} • ${file.mime_type || 'Unknown type'}`,
          timestamp: file.created_at,
          action: 'Uploaded'
        }));

        setRecentActivities(activities);
      } catch (error) {
        console.error("Failed to fetch recent activities:", error);
        // Fallback to mock data if API fails
        setRecentActivities([
          {
            id: '1',
            type: 'upload',
            title: 'project-document.pdf',
            description: '1.0 MB • application/pdf',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            action: 'Uploaded'
          },
          {
            id: '2',
            type: 'download',
            title: 'screenshot.png',
            description: '2.0 MB • image/png',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
            action: 'Downloaded'
          },
          {
            id: '3',
            type: 'share',
            title: 'analytics-report.xlsx',
            description: '3.1 MB • application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            action: 'Shared'
          }
        ]);
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchRecentActivities();
  }, []);

  return (
    <div className="dashboard-page" style={{ gap: "2rem" }}>
      {/* Welcome Section */}
      <header className="welcome-header" style={{ padding: "1.5rem 1.75rem" }}>
        <div className="welcome-content">
          <div className="welcome-message">
            <h1 className="welcome-title">
              Welcome back!
            </h1>
            <p className="welcome-subtitle">
              Your storage overview, at a glance.
            </p>
          </div>
          <div className="welcome-actions">
            <Button variant="outline" onClick={() => navigate("/files")}>
              <FileText className="mr-2 h-4 w-4" />
              View Files
            </Button>
            <Button onClick={() => navigate("/files")}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Files
            </Button>
          </div>
        </div>
      </header>

      {/* Statistics Section */}
      <section className="dashboard-stats" style={{ marginTop: "2rem" }}>
        <StatsCards />
      </section>

      {/* Quick Access Cards */}
      <section className="quick-access-cards" style={{ marginTop: "2rem" }}>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/files")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">File Management</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">
              Files in your vault
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Files</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Public links created
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23%</div>
            <p className="text-xs text-muted-foreground">
              Of 10 GB quota used
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest file uploads and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse w-32"></div>
                      <div className="h-3 bg-muted rounded animate-pulse w-24"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-muted rounded animate-pulse w-16"></div>
                </div>
              ))}
            </div>
          ) : recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={activity.id} className={`flex items-center justify-between ${index < recentActivities.length - 1 ? 'border-b pb-4' : ''}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${
                      activity.action === 'Uploaded' ? 'bg-primary' :
                      activity.action === 'Downloaded' ? 'bg-blue-500' :
                      activity.action === 'Shared' ? 'bg-green-500' : 'bg-muted'
                    }`}>
                      {activity.action === 'Uploaded' && <FileText className="h-4 w-4 text-primary-foreground" />}
                      {activity.action === 'Downloaded' && <Download className="h-4 w-4 text-white" />}
                      {activity.action === 'Shared' && <Share className="h-4 w-4 text-white" />}
                    </div>
                    <div>
                      <p className="font-medium truncate max-w-[200px] sm:max-w-xs lg:max-w-sm">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description} • {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={
                    activity.action === 'Uploaded' ? 'secondary' :
                    activity.action === 'Downloaded' ? 'outline' :
                    activity.action === 'Shared' ? 'default' : 'secondary'
                  }>
                    {activity.action}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No recent activity</h3>
              <p className="text-muted-foreground">
                Your file activities will appear here once you start uploading files.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
  );
}

export default DashboardPage;
