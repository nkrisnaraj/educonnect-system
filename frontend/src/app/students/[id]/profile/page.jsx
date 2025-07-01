"use client";

import Image from "next/image";
import { Camera, User, Mail, MapPin, Phone, GraduationCap, CreditCard, Calendar, Lock, Check } from 'lucide-react';
import { useState } from "react";

export default function EditProfilePage() {
const [formData, setFormData] = useState({
    firstName: '',  
    lastName: '',
    email: '',
    address: '',
    mobile: '',
    school: '',
    nic: '',
    yearAL: '',
    password: ''
  });

const handleInputChange = (e) => {
    setFormData({...formData,[e.target.name]: e.target.value});`~`
  };

  // const handleCancel = () => {
  //   toast.info('Changes cancelled');
  // };

  const handleCancel = () => {
    // Reset form data to initial state
    setFormData({
      firstName: '',  
      lastName: '',
      email: '',
      address: '',
      mobile: '',
      school: '',
      nic: '',
      yearAL: '',
      password: ''
    });
  }

  return (
    <div className="w-full max-w-4xl ">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative bg-white/80 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl p-8 animate-fade-in">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Edit Profile
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Update your personal information and preferences</p>
        </div>

        {/* Profile Image Section */}
        <div className="flex justify-center mb-8">
          <div className="relative group">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl group-hover:scale-105 transition-transform duration-300">
              <img
                src=""
                alt="Profile"
                className="w-full h-full object-cover"
              />
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
                // onChange={handleImageChange}
              />
            </label>
          </div>
        </div>

        {/* Form Section */}
        <form className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-colors duration-200"
                placeholder="Enter your first name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-colors duration-200"
                placeholder="Enter your last name"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-500" />
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-colors duration-200"
              placeholder="Enter your email address"
            />
          </div>

          {/* Address Field */}
          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              Address
            </label>
            <input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-colors duration-200"
              placeholder="Enter your full address"
            />
          </div>

          {/* Mobile and School Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="mobile" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500" />
                Mobile Number
              </label>
              <input
                id="mobile"
                type="tel"
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-colors duration-200"
                placeholder="Enter your mobile number"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="school" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-500" />
                School Name
              </label>
              <input
                id="school"
                type="text"
                value={formData.school}
                onChange={(e) => handleInputChange('school', e.target.value)}
                className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-colors duration-200"
                placeholder="Enter your school name"
              />
            </div>
          </div>

          {/* NIC and Year Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="nic" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-500" />
                NIC Number
              </label>
              <input
                id="nic"
                type="text"
                value={formData.nic}
                onChange={(e) => handleInputChange('nic', e.target.value)}
                className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-colors duration-200"
                placeholder="Enter your NIC number"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="yearAL" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Year of A/L
              </label>
              <input
                id="yearAL"
                type="text"
                value={formData.yearAL}
                onChange={(e) => handleInputChange('yearAL', e.target.value)}
                className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-colors duration-200"
                placeholder="Enter your A/L year"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-500" />
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-colors duration-200"
              placeholder="Enter new password (optional)"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="h-12 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-12 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
            >
              <Check className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
