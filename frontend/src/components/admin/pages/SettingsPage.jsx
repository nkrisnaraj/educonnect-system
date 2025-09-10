"use client"

import { useState, useEffect } from "react"
import { Save, Bell, Shield, Database, Palette, Globe, User, Lock, Eye, EyeOff } from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [showPasswords, setShowPasswords] = useState({})
  const [saveStatus, setSaveStatus] = useState("")
  const [settings, setSettings] = useState({
    general: {
      institutionName: "EduConnect Institute",
      institutionCode: "ECI",
      address: "123 Education Street, Learning City, LC 12345",
      phone: "+1 (555) 123-4567",
      email: "admin@educonnect.edu",
      website: "https://www.educonnect.edu",
      timezone: "America/New_York",
      language: "English",
      dateFormat: "MM/DD/YYYY",
      currency: "USD",
      academicYear: "2024-2025",
      maxStudentsPerClass: 30,
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      weeklyReports: true,
      monthlyReports: true,
      systemAlerts: true,
      paymentReminders: true,
      enrollmentUpdates: true,
      newStudentRegistration: true,
      classScheduleChanges: true,
      examReminders: true,
      webinarNotifications: true,
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginAttempts: 5,
      ipWhitelist: "",
      auditLogging: true,
      dataEncryption: true,
      autoLogout: true,
      passwordComplexity: "strong",
      allowMultipleSessions: false,
    },
    appearance: {
      theme: "light",
      primaryColor: "#2064d4",
      accentColor: "#568be3",
      fontSize: "medium",
      compactMode: false,
      showAnimations: true,
      sidebarCollapsed: false,
      dashboardLayout: "cards",
    },
    system: {
      maintenanceMode: false,
      debugMode: false,
      cacheEnabled: true,
      backupFrequency: "daily",
      logLevel: "info",
      maxFileSize: "10MB",
      sessionStorage: "database",
      autoBackup: true,
      emailService: "smtp",
      databaseOptimization: true,
    },
  })

  const handleSettingChange = (category, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }))
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleSave = async () => {
    setSaveStatus("saving")
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus(""), 3000)
    } catch (error) {
      setSaveStatus("error")
      setTimeout(() => setSaveStatus(""), 3000)
    }
  }

  const renderToggle = (category, key, label, description = "") => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div>
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={settings[category][key]}
          onChange={(e) => handleSettingChange(category, key, e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>
  )

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "system", label: "System", icon: Database },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure system preferences and institutional settings</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            saveStatus === "saved" 
              ? "bg-green-600 text-white" 
              : saveStatus === "error"
              ? "bg-red-600 text-white"
              : "bg-primary text-white hover:bg-primary/90"
          } ${saveStatus === "saving" ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Save className="h-4 w-4" />
          <span>
            {saveStatus === "saving" ? "Saving..." : 
             saveStatus === "saved" ? "Saved!" : 
             saveStatus === "error" ? "Error!" : "Save Changes"}
          </span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="lg:w-64">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* General Settings */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Institution Name</label>
                      <input
                        type="text"
                        value={settings.general.institutionName}
                        onChange={(e) => handleSettingChange("general", "institutionName", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Institution Code</label>
                      <input
                        type="text"
                        value={settings.general.institutionCode}
                        onChange={(e) => handleSettingChange("general", "institutionCode", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <textarea
                        value={settings.general.address}
                        onChange={(e) => handleSettingChange("general", "address", e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={settings.general.phone}
                        onChange={(e) => handleSettingChange("general", "phone", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={settings.general.email}
                        onChange={(e) => handleSettingChange("general", "email", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                      <input
                        type="url"
                        value={settings.general.website}
                        onChange={(e) => handleSettingChange("general", "website", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                      <select
                        value={settings.general.timezone}
                        onChange={(e) => handleSettingChange("general", "timezone", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      >
                        <option value="America/New_York">Eastern Time (UTC-5)</option>
                        <option value="America/Chicago">Central Time (UTC-6)</option>
                        <option value="America/Denver">Mountain Time (UTC-7)</option>
                        <option value="America/Los_Angeles">Pacific Time (UTC-8)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <select
                        value={settings.general.language}
                        onChange={(e) => handleSettingChange("general", "language", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                      <input
                        type="text"
                        value={settings.general.academicYear}
                        onChange={(e) => handleSettingChange("general", "academicYear", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Students per Class</label>
                      <input
                        type="number"
                        value={settings.general.maxStudentsPerClass}
                        onChange={(e) => handleSettingChange("general", "maxStudentsPerClass", parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">General Notifications</h4>
                      <div className="space-y-3">
                        {renderToggle("notifications", "emailNotifications", "Email Notifications", "Receive notifications via email")}
                        {renderToggle("notifications", "smsNotifications", "SMS Notifications", "Receive notifications via SMS")}
                        {renderToggle("notifications", "pushNotifications", "Push Notifications", "Receive browser push notifications")}
                        {renderToggle("notifications", "systemAlerts", "System Alerts", "Critical system notifications")}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Academic Notifications</h4>
                      <div className="space-y-3">
                        {renderToggle("notifications", "newStudentRegistration", "New Student Registration", "When new students register")}
                        {renderToggle("notifications", "enrollmentUpdates", "Enrollment Updates", "Class enrollment changes")}
                        {renderToggle("notifications", "classScheduleChanges", "Schedule Changes", "Class schedule modifications")}
                        {renderToggle("notifications", "examReminders", "Exam Reminders", "Upcoming exam notifications")}
                        {renderToggle("notifications", "webinarNotifications", "Webinar Notifications", "Webinar-related updates")}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Financial Notifications</h4>
                      <div className="space-y-3">
                        {renderToggle("notifications", "paymentReminders", "Payment Reminders", "Overdue payment notifications")}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Reports</h4>
                      <div className="space-y-3">
                        {renderToggle("notifications", "weeklyReports", "Weekly Reports", "Automated weekly summary reports")}
                        {renderToggle("notifications", "monthlyReports", "Monthly Reports", "Automated monthly analytics reports")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Authentication</h4>
                      <div className="space-y-4">
                        {renderToggle("security", "twoFactorAuth", "Two-Factor Authentication", "Require 2FA for admin accounts")}
                        {renderToggle("security", "autoLogout", "Auto Logout", "Automatically logout inactive users")}
                        {renderToggle("security", "allowMultipleSessions", "Multiple Sessions", "Allow users to login from multiple devices")}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                            <input
                              type="number"
                              value={settings.security.sessionTimeout}
                              onChange={(e) => handleSettingChange("security", "sessionTimeout", parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                            <input
                              type="number"
                              value={settings.security.loginAttempts}
                              onChange={(e) => handleSettingChange("security", "loginAttempts", parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Password Policy</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Password Complexity</label>
                          <select
                            value={settings.security.passwordComplexity}
                            onChange={(e) => handleSettingChange("security", "passwordComplexity", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          >
                            <option value="basic">Basic (8+ characters)</option>
                            <option value="medium">Medium (8+ chars, numbers)</option>
                            <option value="strong">Strong (8+ chars, numbers, symbols)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
                          <input
                            type="number"
                            value={settings.security.passwordExpiry}
                            onChange={(e) => handleSettingChange("security", "passwordExpiry", parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Data Protection</h4>
                      <div className="space-y-3">
                        {renderToggle("security", "dataEncryption", "Data Encryption", "Encrypt sensitive data at rest")}
                        {renderToggle("security", "auditLogging", "Audit Logging", "Log all administrative actions")}
                        
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">IP Whitelist (one per line)</label>
                          <textarea
                            value={settings.security.ipWhitelist}
                            onChange={(e) => handleSettingChange("security", "ipWhitelist", e.target.value)}
                            rows={4}
                            placeholder="192.168.1.1&#10;10.0.0.0/8"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance Settings</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Theme</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Color Theme</label>
                          <select
                            value={settings.appearance.theme}
                            onChange={(e) => handleSettingChange("appearance", "theme", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto (system preference)</option>
                          </select>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={settings.appearance.primaryColor}
                                onChange={(e) => handleSettingChange("appearance", "primaryColor", e.target.value)}
                                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                              />
                              <input
                                type="text"
                                value={settings.appearance.primaryColor}
                                onChange={(e) => handleSettingChange("appearance", "primaryColor", e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={settings.appearance.accentColor}
                                onChange={(e) => handleSettingChange("appearance", "accentColor", e.target.value)}
                                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                              />
                              <input
                                type="text"
                                value={settings.appearance.accentColor}
                                onChange={(e) => handleSettingChange("appearance", "accentColor", e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Layout</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                          <select
                            value={settings.appearance.fontSize}
                            onChange={(e) => handleSettingChange("appearance", "fontSize", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Dashboard Layout</label>
                          <select
                            value={settings.appearance.dashboardLayout}
                            onChange={(e) => handleSettingChange("appearance", "dashboardLayout", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          >
                            <option value="cards">Cards</option>
                            <option value="list">List</option>
                            <option value="grid">Grid</option>
                          </select>
                        </div>
                        
                        <div className="space-y-3">
                          {renderToggle("appearance", "compactMode", "Compact Mode", "Reduce spacing and padding")}
                          {renderToggle("appearance", "showAnimations", "Show Animations", "Enable smooth transitions and animations")}
                          {renderToggle("appearance", "sidebarCollapsed", "Sidebar Collapsed", "Start with collapsed sidebar")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Settings */}
            {activeTab === "system" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">System Status</h4>
                      <div className="space-y-3">
                        {renderToggle("system", "maintenanceMode", "Maintenance Mode", "Put system in maintenance mode")}
                        {renderToggle("system", "debugMode", "Debug Mode", "Enable detailed error logging (development only)")}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Performance</h4>
                      <div className="space-y-4">
                        {renderToggle("system", "cacheEnabled", "Cache Enabled", "Enable system caching for better performance")}
                        {renderToggle("system", "databaseOptimization", "Database Optimization", "Automatic database optimization")}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Max File Size</label>
                            <select
                              value={settings.system.maxFileSize}
                              onChange={(e) => handleSettingChange("system", "maxFileSize", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            >
                              <option value="5MB">5 MB</option>
                              <option value="10MB">10 MB</option>
                              <option value="25MB">25 MB</option>
                              <option value="50MB">50 MB</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Log Level</label>
                            <select
                              value={settings.system.logLevel}
                              onChange={(e) => handleSettingChange("system", "logLevel", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            >
                              <option value="error">Error Only</option>
                              <option value="warning">Warning & Error</option>
                              <option value="info">Info, Warning & Error</option>
                              <option value="debug">All (Debug Mode)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Backup & Storage</h4>
                      <div className="space-y-4">
                        {renderToggle("system", "autoBackup", "Automatic Backup", "Enable scheduled automatic backups")}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                            <select
                              value={settings.system.backupFrequency}
                              onChange={(e) => handleSettingChange("system", "backupFrequency", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            >
                              <option value="hourly">Hourly</option>
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Session Storage</label>
                            <select
                              value={settings.system.sessionStorage}
                              onChange={(e) => handleSettingChange("system", "sessionStorage", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            >
                              <option value="database">Database</option>
                              <option value="redis">Redis</option>
                              <option value="memory">Memory</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Email Service</h4>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Provider</label>
                        <select
                          value={settings.system.emailService}
                          onChange={(e) => handleSettingChange("system", "emailService", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                          <option value="smtp">SMTP</option>
                          <option value="sendgrid">SendGrid</option>
                          <option value="mailgun">Mailgun</option>
                          <option value="amazon-ses">Amazon SES</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other settings tabs would show placeholder content */}
            {!["general", "notifications", "security", "appearance", "system"].includes(activeTab) && (
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings
                </h3>
                <p className="text-gray-600">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} configuration options will be displayed here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
