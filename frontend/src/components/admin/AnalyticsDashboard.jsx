import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Activity, Users, Upload, Download, Clock, TrendingUp, TrendingDown } from "lucide-react";

function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState({
    totalUsers: 156,
    activeUsersToday: 42,
    totalUploads: 2847,
    totalDownloads: 15432,
    avgSessionTime: 245, // seconds
    userGrowth: [],
    activityTrends: [],
    topActivities: [],
  });

  useEffect(() => {
    // Mock analytics data
    const mockData = {
      totalUsers: 156,
      activeUsersToday: 42,
      totalUploads: 2847,
      totalDownloads: 15432,
      avgSessionTime: 245,
      userGrowth: [
        { month: 'Aug', users: 89 },
        { month: 'Sep', users: 112 },
        { month: 'Oct', users: 134 },
        { month: 'Nov', users: 145 },
        { month: 'Dec', users: 156 },
      ],
      activityTrends: [
        { date: '2024-01-01', uploads: 45, downloads: 123, users: 23 },
        { date: '2024-01-02', uploads: 52, downloads: 145, users: 28 },
        { date: '2024-01-03', uploads: 38, downloads: 98, users: 19 },
        { date: '2024-01-04', uploads: 67, downloads: 187, users: 34 },
        { date: '2024-01-05', uploads: 59, downloads: 156, users: 31 },
        { date: '2024-01-06', uploads: 78, downloads: 201, users: 39 },
        { date: '2024-01-07', uploads: 64, downloads: 178, users: 35 },
      ],
      topActivities: [
        { action: 'File Upload', count: 2847, change: 12.5, trend: 'up' },
        { action: 'File Download', count: 15432, change: 8.3, trend: 'up' },
        { action: 'File View', count: 8934, change: -2.1, trend: 'down' },
        { action: 'File Share', count: 1245, change: 15.7, trend: 'up' },
        { action: 'Profile Update', count: 456, change: 5.2, trend: 'up' },
      ],
    };

    setAnalyticsData(mockData);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Analytics Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +8.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.activeUsersToday}</div>
            <p className="text-xs text-muted-foreground">
              {((analyticsData.activeUsersToday / analyticsData.totalUsers) * 100).toFixed(1)}% of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalUploads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Files uploaded this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(analyticsData.avgSessionTime)}</div>
            <p className="text-xs text-muted-foreground">
              Average user session time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
          <CardDescription>
            Monthly user registration trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Activity Trends */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activity Trends</CardTitle>
            <CardDescription>
              Daily uploads and downloads over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.activityTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <Bar dataKey="uploads" fill="#3b82f6" name="Uploads" />
                  <Bar dataKey="downloads" fill="#10b981" name="Downloads" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Activities</CardTitle>
            <CardDescription>
              Most frequent user actions this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topActivities.map((activity, index) => (
                <div key={activity.action} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.count.toLocaleString()} times</p>
                    </div>
                  </div>
                  <Badge
                    variant={activity.trend === 'up' ? 'default' : 'secondary'}
                    className={activity.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  >
                    {activity.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(activity.change)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>System Performance Insights</CardTitle>
          <CardDescription>
            Key performance indicators and system health metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">1.2s</div>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">4.7/5</div>
              <p className="text-sm text-muted-foreground">User Satisfaction</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AnalyticsDashboard;
