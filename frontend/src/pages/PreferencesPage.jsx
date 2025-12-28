import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Bell, Globe, Shield, Save } from "lucide-react";

function PreferencesPage() {
  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      push: false,
      fileUploads: true,
      fileShares: true,
      storageWarnings: true,
    },
    privacy: {
      publicProfile: false,
      showEmail: false,
      allowFileRequests: true,
    },
    language: "en",
    timezone: "UTC",
  });

  const handleSave = () => {
    // TODO: Implement preferences save
    console.log("Saving preferences:", preferences);
  };

  const updatePreference = (category, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: typeof prev[category] === 'object'
        ? { ...prev[category], [key]: value }
        : value
    }));
  };

  return (
    <div className="preferences-page">
      {/* Page Header */}
      <header className="preferences-header">
        <div className="header-content">
          <h1 className="preferences-title">Preferences</h1>
          <p className="preferences-subtitle">
            Customize your account settings and preferences.
          </p>
        </div>
      </header>

      {/* Preferences Content */}
      <div className="preferences-content">

        {/* Notification Settings */}
        <Card className="preferences-card">
          <CardHeader>
            <CardTitle className="card-title">
              <Bell className="title-icon" />
              Notifications
            </CardTitle>
            <CardDescription>
              Choose what notifications you want to receive.
            </CardDescription>
          </CardHeader>
          <CardContent className="card-content">
            <div className="notification-settings">
              <div className="setting-item">
                <div className="setting-info">
                  <Label className="setting-label">Email Notifications</Label>
                  <p className="setting-description">Receive notifications via email</p>
                </div>
                <Switch
                  checked={preferences.notifications.email}
                  onCheckedChange={(checked) => updatePreference('notifications', 'email', checked)}
                />
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <Label className="setting-label">Push Notifications</Label>
                  <p className="setting-description">Receive push notifications in your browser</p>
                </div>
                <Switch
                  checked={preferences.notifications.push}
                  onCheckedChange={(checked) => updatePreference('notifications', 'push', checked)}
                />
              </div>

              <Separator className="settings-separator" />

              <div className="setting-item">
                <div className="setting-info">
                  <Label className="setting-label">File Uploads</Label>
                  <p className="setting-description">Notify when files are uploaded</p>
                </div>
                <Switch
                  checked={preferences.notifications.fileUploads}
                  onCheckedChange={(checked) => updatePreference('notifications', 'fileUploads', checked)}
                />
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <Label className="setting-label">File Shares</Label>
                  <p className="setting-description">Notify when files are shared with you</p>
                </div>
                <Switch
                  checked={preferences.notifications.fileShares}
                  onCheckedChange={(checked) => updatePreference('notifications', 'fileShares', checked)}
                />
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <Label className="setting-label">Storage Warnings</Label>
                  <p className="setting-description">Notify when approaching storage limits</p>
                </div>
                <Switch
                  checked={preferences.notifications.storageWarnings}
                  onCheckedChange={(checked) => updatePreference('notifications', 'storageWarnings', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="preferences-card">
          <CardHeader>
            <CardTitle className="card-title">
              <Shield className="title-icon" />
              Privacy
            </CardTitle>
            <CardDescription>
              Control your privacy and data sharing preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="card-content">
            <div className="privacy-settings">
              <div className="setting-item">
                <div className="setting-info">
                  <Label className="setting-label">Public Profile</Label>
                  <p className="setting-description">Make your profile visible to other users</p>
                </div>
                <Switch
                  checked={preferences.privacy.publicProfile}
                  onCheckedChange={(checked) => updatePreference('privacy', 'publicProfile', checked)}
                />
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <Label className="setting-label">Show Email</Label>
                  <p className="setting-description">Display your email address on your public profile</p>
                </div>
                <Switch
                  checked={preferences.privacy.showEmail}
                  onCheckedChange={(checked) => updatePreference('privacy', 'showEmail', checked)}
                />
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <Label className="setting-label">Allow File Requests</Label>
                  <p className="setting-description">Let other users request access to your files</p>
                </div>
                <Switch
                  checked={preferences.privacy.allowFileRequests}
                  onCheckedChange={(checked) => updatePreference('privacy', 'allowFileRequests', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card className="preferences-card">
          <CardHeader>
            <CardTitle className="card-title">
              <Globe className="title-icon" />
              Regional
            </CardTitle>
            <CardDescription>
              Set your language and timezone preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="card-content">
            <div className="regional-settings">
              <div className="setting-group">
                <Label className="setting-label">Language</Label>
                <Select
                  value={preferences.language}
                  onValueChange={(value) => updatePreference('language', null, value)}
                >
                  <SelectTrigger className="language-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="setting-group">
                <Label className="setting-label">Timezone</Label>
                <Select
                  value={preferences.timezone}
                  onValueChange={(value) => updatePreference('timezone', null, value)}
                >
                  <SelectTrigger className="timezone-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="EST">Eastern Time</SelectItem>
                    <SelectItem value="PST">Pacific Time</SelectItem>
                    <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="save-section">
          <Button onClick={handleSave} className="save-preferences-button">
            <Save className="save-icon" />
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PreferencesPage;

