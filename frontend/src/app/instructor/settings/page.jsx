"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import {
  User,
  Lock,
  Camera,
  Save,
  Eye,
  EyeOff,
  Upload,
  X,
  Edit,
} from "lucide-react";

export default function SettingsPage() {
  const { accessToken, refreshAccessToken, logout } = useAuth();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username : "",
    phone: "",
    address: "",
    profileImage: "",
  });

  const fetchProfile = async (token) => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/instructor/profile/", {
        headers: { Authorization: `Bearer ${token}`},
      });

      const data = res.data;
      setProfileData({
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        username: data.username,
        phone: data.phone,
        address: data.address,
        profileImage: data.profile_image,
      });
    } catch (err) {
      if (err.response?.status === 401) {
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            fetchProfile(newToken);
          } else {
            logout();
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          logout();
        }
      } else {
        console.error(err);
        alert("Failed to load profile.");
      }
    }
  };

  useEffect(() => {
    if (accessToken) fetchProfile(accessToken);
  }, [accessToken]);

  const handleProfileUpdate = async (newToken = null) => {
    try {
      const tokenToUse =
        newToken || accessToken || sessionStorage.getItem("accessToken");
      
      const formData = new FormData();

      formData.append("first_name", profileData.firstName);
      formData.append("last_name", profileData.lastName);
      formData.append("email", profileData.email);
      formData.append("username", profileData.username)
      formData.append("phone", profileData.phone);
      formData.append("address", profileData.address);

      if (profileData.profileImageFile) {
        formData.append("profile_image", profileData.profileImageFile);
      }
      const response = await fetch(
        "http://127.0.0.1:8000/instructor/profile/",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${tokenToUse}`,
          },
          body: formData,
        }
      );

      if (response.status === 401) {
        const refreshedToken = await refreshAccessToken();
        if (refreshedToken) {
          return handleProfileUpdate(refreshedToken);
        }
        logout();
        return;
      }

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      alert("Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile.");
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileData((prevData) => ({
        ...prevData,
        profileImage: e.target.result, // Preview image
        profileImageFile: file, // Actual file to upload
      }));
      setIsImageModalOpen(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="w-full flex justify-center">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Profile Section */}
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <User className="h-6 w-6 text-purple-600" />
              <div>
                <h2 className="text-xl font-semibold">Profile Information</h2>
                <p className="text-gray-600">
                  {isEditingProfile
                    ? "Update your personal information and password"
                    : "View your profile details"}
                </p>
              </div>
            </div>
            {!isEditingProfile && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-accent"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={profileData.profileImage ? profileData.profileImage : "/file.svg"}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-purple-200"
                />
                {isEditingProfile && (
                  <button
                    onClick={() => setIsImageModalOpen(true)}
                    className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-accent"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Profile Picture</h3>
                <p className="text-sm text-gray-600">
                  {isEditingProfile
                    ? "JPG, PNG or GIF. Max size 2MB."
                    : "Your current profile picture"}
                </p>
                {isEditingProfile && (
                  <button
                    onClick={() => setIsImageModalOpen(true)}
                    className="mt-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
                  >
                    Change Picture
                  </button>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">
                    {profileData.firstName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        lastName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">
                    {profileData.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {isEditingProfile ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">
                    {profileData.email}
                  </p>
                )}
              </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                {isEditingProfile ? (
                  <input
                    type="email"
                    value={profileData.username}
                    onChange={(e) =>
                      setProfileData({ ...profileData, username: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">
                    {profileData.username}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                {isEditingProfile ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">
                    {profileData.phone}
                  </p>
                )}
              </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              {isEditingProfile ? (
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) =>
                    setProfileData({ ...profileData, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">
                  {profileData.address}
                </p>
              )}
            </div>

            {isEditingProfile && (
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCancelEdit}
                  className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProfileUpdate}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-accent"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Upload Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Change Profile Picture</h2>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center">
                <Upload className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload new picture
                </h3>
                <p className="text-gray-600 mb-4">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-accent cursor-pointer inline-block"
                >
                  Choose File
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}