"use client"

import { useState } from "react"
import { Save, Bell, Shield, Database, Palette, Globe } from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState({
    general: {
      institutionName: "AdminConnect University",
      institutionCode: "ACU",
      address: "123 Education Street, Learning City, LC 12345",
      phone: "+1 (555) 123-4567",
      email: "admin@adminconnect.edu",
      website: "https://www.adminconnect.edu",
      timezone: "America/New_York",
      language: "English",
      dateFormat: "MM/DD/YYYY",
      currency: "USD",
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
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginAttempts: 5,
      ipWhitelist: "",
      auditLogging: true,
      dataEncryption: true,
    },
    appearance: {
      theme: "light",
      primaryColor: "#2064d4",
      accentColor: "#568be3",
      fontSize: "medium",
      compactMode: false,
      showAnimations: true,
    },
    system: {
      maintenanceMode: false,
      debugMode: false,
      cacheEnabled: true,
      backupFrequency: "daily",
      logLevel: "info",
      maxFileSize: "10MB",
      sessionStorage: "database",
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
        <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
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
                  </div>
                </div>
              </div>
            )}

            {/* Other settings tabs would show placeholder content */}
            {activeTab !== "general" && (
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
