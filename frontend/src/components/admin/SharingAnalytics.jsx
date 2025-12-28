import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Share, Eye, Download, TrendingUp, Users, Link } from "lucide-react";

function SharingAnalytics() {
  const [sharingData, setSharingData] = useState({
    totalSharedFiles: 234,
    totalPublicLinks: 89,
    totalDownloads: 1547,
    activeShares: 45,
    sharingTrends: [],
    popularFiles: [],
  });

  useEffect(() => {
    // Mock sharing analytics data
    const mockData = {
      totalSharedFiles: 234,
      totalPublicLinks: 89,
      totalDownloads: 1547,
      activeShares: 45,
      sharingTrends: [
        { date: '2024-01-01', shares: 12, downloads: 45 },
        { date: '2024-01-02', shares: 15, downloads: 52 },
        { date: '2024-01-03', shares: 8, downloads: 38 },
        { date: '2024-01-04', shares: 22, downloads: 67 },
        { date: '2024-01-05', shares: 18, downloads: 59 },
        { date: '2024-01-06', shares: 25, downloads: 78 },
        { date: '2024-01-07', shares: 20, downloads: 64 },
      ],
      popularFiles: [
        { name: 'project-proposal.pdf', downloads: 156, shares: 12, size: '2.3 MB' },
        { name: 'company-presentation.pptx', downloads: 134, shares: 8, size: '5.1 MB' },
        { name: 'user-manual.pdf', downloads: 98, shares: 15, size: '1.8 MB' },
        { name: 'training-video.mp4', downloads: 87, shares: 6, size: '45.2 MB' },
        { name: 'data-report.xlsx', downloads: 76, shares: 9, size: '3.2 MB' },
      ],
    };

    setSharingData(mockData);
  }, []);

  return (
    <div className="space-y-6">
      {/* Sharing Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Files</CardTitle>
            <Share className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sharingData.totalSharedFiles}</div>
            <p className="text-xs text-muted-foreground">
              Files currently shared
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Public Links</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sharingData.totalPublicLinks}</div>
            <p className="text-xs text-muted-foreground">
              Active public links
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sharingData.totalDownloads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Downloads from shared files
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shares</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sharingData.activeShares}</div>
            <p className="text-xs text-muted-foreground">
              Currently being viewed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sharing Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sharing Activity Trends</CardTitle>
          <CardDescription>
            Daily sharing and download activity over the past week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sharingData.sharingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value, name) => [value, name === 'shares' ? 'New Shares' : 'Downloads']}
                />
                <Area
                  type="monotone"
                  dataKey="shares"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                  name="shares"
                />
                <Area
                  type="monotone"
                  dataKey="downloads"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                  name="downloads"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Popular Shared Files */}
      <Card>
        <CardHeader>
          <CardTitle>Most Popular Shared Files</CardTitle>
          <CardDescription>
            Files with the highest download and sharing activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sharingData.popularFiles.map((file, index) => (
              <div key={file.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">#{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{file.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{file.downloads} downloads</p>
                    <p className="text-xs text-muted-foreground">{file.shares} shares</p>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sharing Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sharing Insights</CardTitle>
            <CardDescription>
              Key metrics and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Average downloads per shared file</span>
              <Badge variant="outline">6.6</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Most active sharing day</span>
              <Badge variant="outline">Wednesday</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Popular file types</span>
              <Badge variant="outline">PDF, PPTX</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sharing Recommendations</CardTitle>
            <CardDescription>
              Suggestions to improve file sharing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <Users className="h-4 w-4 inline mr-2" />
                <strong>Tip:</strong> Files shared with specific users get 40% more downloads than public links.
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                <TrendingUp className="h-4 w-4 inline mr-2" />
                <strong>Insight:</strong> Documents under 5MB get shared 3x more frequently.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SharingAnalytics;
