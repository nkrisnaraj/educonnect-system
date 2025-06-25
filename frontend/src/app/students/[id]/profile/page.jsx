"use client";

import Image from "next/image";

export default function EditProfilePage() {
  return (
    <div className="max-w-6xl bg-white px-4 py-6 shadow-lg sm:px-6 lg:px-8 rounded-2xl">
        {/* Header and profile image */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center md:text-left">
            Edit Profile
          </h1>

          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 mb-2">
              <Image
                src="/placeholder.svg?height=80&width=80"
                alt="Profile"
                width={80}
                height={80}
                className="rounded-full object-cover border border-primary"
              />
            </div>
            <label className="text-sm text-blue-600 font-medium cursor-pointer hover:underline">
              Change Profile
              <input type="file" accept="image/*" className="hidden" />
            </label>
          </div>
        </div>

        {/* Form */}
        <form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <input
              type="text"
              placeholder="First Name"
              className="p-3 border border-gray-300 rounded-md w-full"
            />
            <input
              type="text"
              placeholder="Last Name"
              className="p-3 border border-gray-300 rounded-md w-full"
            />
          </div>

          <input
            type="email"
            placeholder="Email"
            className="w-full mb-6 p-3 border border-gray-300 rounded-md"
          />

          <input
            type="text"
            placeholder="Address"
            className="w-full mb-6 p-3 border border-gray-300 rounded-md"
          />

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <input
              type="tel"
              placeholder="Mobile No"
              className="p-3 border border-gray-300 rounded-md w-full"
            />
            <input
              type="text"
              placeholder="School Name"
              className="p-3 border border-gray-300 rounded-md w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <input
              type="text"
              placeholder="NIC No"
              className="p-3 border border-gray-300 rounded-md w-full"
            />
            <input
              type="text"
              placeholder="Year_of_A/L"
              className="p-3 border border-gray-300 rounded-md w-full"
            />
          </div>

          <input
            type="password"
            placeholder="Password"
            className="w-full mb-8 p-3 border border-gray-300 rounded-md"
          />

          <div className="flex flex-col sm:flex-row flex-wrap gap-4">
            <button
              type="button"
              className="px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Save
            </button>
          </div>
        </form>
      
    </div>
  );
}
