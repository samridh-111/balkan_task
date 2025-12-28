import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/services/authservices";
import { User, Mail, Shield, Calendar } from "lucide-react";

function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || "",
    name: user?.name || "User Name", // Use user.name if available
  });

  // Update form data when user changes (e.g., after login)
  React.useEffect(() => {
    setFormData({
      email: user?.email || "",
      name: user?.name || "User Name",
    });
  }, [user]);

  const handleSave = () => {
    // Update the user profile
    updateProfile({
      name: formData.name,
      email: formData.email,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      email: user?.email || "",
      name: "User Name",
    });
    setIsEditing(false);
  };

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <header className="profile-header">
        <div className="profile-info">
          <Avatar className="profile-avatar">
            <AvatarImage src="" alt="Profile picture" />
            <AvatarFallback className="profile-avatar-fallback">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="profile-details">
            <h1 className="profile-name">{formData.name}</h1>
            <p className="profile-email">{user?.email}</p>
            <div className="profile-meta">
              <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'} className="profile-role">
                <Shield className="role-icon" />
                {user?.role || 'user'}
              </Badge>
              <span className="profile-join-date">
                <Calendar className="date-icon" />
                Joined recently
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Account Information */}
        <Card className="profile-card">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Update your account details and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="profile-form">
            <div className="form-section">
              <div className="form-field">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className="profile-input"
                />
              </div>

              <div className="form-field">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className="profile-input"
                />
              </div>
            </div>

            <Separator className="form-separator" />

            <div className="form-actions">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="edit-button">
                  Edit Profile
                </Button>
              ) : (
                <div className="edit-actions">
                  <Button variant="outline" onClick={handleCancel} className="cancel-button">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="save-button">
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card className="profile-card">
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
            <CardDescription>
              Your account usage and activity overview.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">42</div>
                <div className="stat-label">Files Uploaded</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">2.3 GB</div>
                <div className="stat-label">Storage Used</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">15</div>
                <div className="stat-label">Downloads</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">5</div>
                <div className="stat-label">Shared Files</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProfilePage;
