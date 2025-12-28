import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { HardDrive, TrendingUp, AlertTriangle } from "lucide-react";

function StorageChart() {
  const [storageData, setStorageData] = useState({
    totalStorage: 21474836480, // 20 GB
    usedStorage: 8589934592,   // 8 GB
    deduplicationSavings: 1170000000, // 1.17 GB saved
    userStorageBreakdown: [],
  });

  useEffect(() => {
    // Mock storage breakdown data
    const mockData = {
      totalStorage: 21474836480, // 20 GB
      usedStorage: 8589934592,   // 8 GB
      deduplicationSavings: 1170000000, // 1.17 GB saved
      userStorageBreakdown: [
        { name: "John Doe", email: "john@example.com", storage: 1073741824, files: 45 }, // 1 GB
        { name: "Jane Smith", email: "jane@example.com", storage: 536870912, files: 23 }, // 512 MB
        { name: "Admin User", email: "admin@example.com", storage: 2147483648, files: 89 }, // 2 GB
        { name: "Bob Wilson", email: "bob@example.com", storage: 268435456, files: 12 }, // 256 MB
        { name: "Others", email: "various", storage: 4294967296, files: 156 }, // 4 GB
      ],
    };

    setStorageData(mockData);
  }, []);

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Prepare data for pie chart (storage distribution)
  const pieData = [
    {
      name: "Used Storage",
      value: storageData.usedStorage,
      color: "#3b82f6",
    },
    {
      name: "Available Storage",
      value: storageData.totalStorage - storageData.usedStorage,
      color: "#e5e7eb",
    },
  ];

  // Prepare data for bar chart (user breakdown)
  const barData = storageData.userStorageBreakdown.map(user => ({
    name: user.name.split(' ')[0], // First name only for chart
    storage: user.storage / (1024 * 1024), // Convert to MB
    files: user.files,
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const usagePercentage = ((storageData.usedStorage / storageData.totalStorage) * 100).toFixed(1);
  const isNearLimit = usagePercentage > 80;

  return (
    <div className="space-y-6">
      {/* Storage Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(storageData.totalStorage)}</div>
            <p className="text-xs text-muted-foreground">
              System storage limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Usage</CardTitle>
            {isNearLimit ? (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            ) : (
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(storageData.usedStorage)}</div>
            <p className="text-xs text-muted-foreground">
              {usagePercentage}% utilized
            </p>
            {isNearLimit && (
              <Badge variant="destructive" className="mt-2">
                Near capacity limit
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deduplication Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatBytes(storageData.deduplicationSavings)}
            </div>
            <p className="text-xs text-muted-foreground">
              Space saved through deduplication
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Storage Usage Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Storage Distribution</CardTitle>
            <CardDescription>
              Current storage usage breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatBytes(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Storage Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Storage Usage</CardTitle>
            <CardDescription>
              Storage consumption by user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'storage') return [`${value.toFixed(1)} MB`, 'Storage Used'];
                      return [value, 'Files'];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="storage" fill="#3b82f6" name="Storage (MB)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed User Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>User Storage Details</CardTitle>
          <CardDescription>
            Detailed breakdown of storage usage by user
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {storageData.userStorageBreakdown.map((user, index) => (
              <div key={user.email} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  >
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatBytes(user.storage)}</p>
                  <p className="text-sm text-muted-foreground">{user.files} files</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StorageChart;


