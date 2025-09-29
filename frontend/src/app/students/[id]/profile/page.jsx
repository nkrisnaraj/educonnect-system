"use client";

import Image from "next/image";
import { Camera, User, Mail, MapPin, Phone, GraduationCap, CreditCard, Calendar, Lock, Check } from 'lucide-react';
import { useEffect, useState } from "react";
import axios from "axios";
import {useAuth} from "@/context/AuthContext";
import { ref } from "process";


export default function EditProfilePage() {
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [image, setImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const {user, accessToken, refreshToken, refreshAccessToken, api, loading: authLoading} = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    district: '',
    mobile: '',
    school: '',
    nic: '',
    yearAL: '',
    password: ''
  });
  

  
  console.log(accessToken);
 

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setPageLoading(true);
        setError(null);
        
        // Wait for auth context to load
        if (authLoading) {
          console.log("Auth context still loading, waiting...");
          return;
        }
        
        if (!accessToken) {
          console.log("No access token available");
          setPageLoading(false);
          return;
        }
        
        console.log("Fetching profile with token:", accessToken ? 'Token exists' : 'No token');
        const response = await api.get("/students/profile/",{
          headers:{
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        const userData = response.data;
        const profile = userData.student_profile;
        
        setFormData({
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
          email: userData.email || '',
          address: profile?.address || '',
          city: profile?.city || '',
          district: profile?.district || '',
          mobile: profile?.mobile || '',
          school: profile?.school_name || '',
          nic: profile?.nic_no || '',
          yearAL: profile?.year_of_al || '',
          password: '',
          profile_image: profile?.profile_image || ''
        });
        
        console.log("Profile fetched successfully:", userData);
      } catch (error) {
        console.error('Error fetching profile:', error);
        
        // Handle 401 errors with token refresh
        if (error.response?.status === 401) {
          console.log("Got 401, attempting token refresh");
          try {
            const newToken = await refreshAccessToken();
            if (newToken) {
              console.log("Token refreshed, retrying profile fetch...");
              setTimeout(() => fetchProfile(), 1000);
              return;
            }
          } catch (refreshError) {
            console.error("Failed to refresh token:", refreshError);
            setError("Session expired. Please login again.");
          }
        } else {
          setError("Failed to load profile. Please try again.");
        }
      } finally {
        setPageLoading(false);
      }
    };
    
    fetchProfile();
  }, [authLoading, accessToken]); // Add authLoading dependency

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      let token = accessToken;
      if (!token) {
        token = await refreshAccessToken();
      }
      if (!token) {
        setError('No access token available. Please login again.');
        setSaving(false);
        return;
      }
      
      const data = new FormData();
      data.append("first_name", formData.firstName);
      data.append("last_name", formData.lastName);
      data.append("email", formData.email);
      data.append("address", formData.address);
      data.append("city", formData.city);
      data.append("district", formData.district);
      data.append("mobile", formData.mobile);
      data.append("school_name", formData.school);
      data.append("nic_no", formData.nic);
      data.append("year_of_al", formData.yearAL);
      if (formData.password) data.append("password", formData.password);
      if (selectedImage) data.append("profile_image", selectedImage);

      const res = await axios.put('http://127.0.0.1:8000/students/profile/', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      
      if (res.status === 200) {
        setSuccess('Profile updated successfully!');
        // Clear the selected image after successful update
        setSelectedImage(null);
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else if (error.response?.status === 400) {
        setError('Invalid data. Please check your inputs.');
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      address: '',
      city: '',
      district: '',
      mobile: '',
      school: '',
      nic: '',
      yearAL: '',
      password: '',
      profile_image: ''

    });
    setSelectedImage(null);
  };

  // Show loading state while auth is loading or profile is fetching
  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative bg-white/90 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl p-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-800 rounded-2xl shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-dark-800">
              Edit Profile
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Update your personal information and preferences</p>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
            <p className="font-medium">Success</p>
            <p>{success}</p>
          </div>
        )}

        {/* Profile Image */}
        <div className="flex justify-center mb-8">
          <div className="relative group">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl group-hover:scale-105 transition-transform duration-300">
              {selectedImage ? (
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              ) : formData.profile_image ? (
                  <img
                    src={`http://127.0.0.1:8000${formData.profile_image}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) :(
                <img
                  src="/images/icons/profile1.png"
                  alt="Default Profile"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <label className="absolute -bottom-2 -right-2 p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setSelectedImage(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4"
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4"
                placeholder="Enter your last name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-500" />
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4"
              placeholder="Enter your email address"
            />
          </div>

          {/* Address */}
          <div>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4"
              placeholder="Enter your full address"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4"
              placeholder="Enter your full address"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              District
            </label>
            <input
              type="text"
              value={formData.district}
              onChange={(e) => handleInputChange('district', e.target.value)}
              className="w-full h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4"
              placeholder="Enter your full address"
            />
          </div>

          {/* Mobile and School */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500" />
                Mobile Number
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                className="w-full h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4"
                placeholder="Enter your mobile number"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-500" />
                School Name
              </label>
              <input
                type="text"
                value={formData.school}
                onChange={(e) => handleInputChange('school', e.target.value)}
                className="w-full h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4"
                placeholder="Enter your school name"
              />
            </div>
          </div>

          {/* NIC and Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-500" />
                NIC Number
              </label>
              <input
                type="text"
                value={formData.nic}
                onChange={(e) => handleInputChange('nic', e.target.value)}
                className="w-full h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4"
                placeholder="Enter your NIC number"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Year of A/L
              </label>
              <input
                type="text"
                value={formData.yearAL}
                onChange={(e) => handleInputChange('yearAL', e.target.value)}
                className="w-full h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4"
                placeholder="Enter your A/L year"
              />
            </div>
          </div>

          {/* Password */}
          {/* <div>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-500" />
              New Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4"
              placeholder="Enter new password (optional)"
            />
          </div> */}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="h-12 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-12 px-8 bg-gradient-to-r from-blue-400 to-blue-900 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
            >
              <Check className="w-4 h-4 mr-2 inline-block" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
