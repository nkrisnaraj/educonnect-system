"use client";
import Footer from "@/components/Footer";
import MainNavbar from "@/components/MainNavbar";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    setSuccessMessage("Message sent successfully!");
    setFormData({ name: "", email: "", message: "" });

    // Hide the success message after 3 seconds
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <>
    <MainNavbar />
    <div className="min-h-screen flex items-center justify-center ">
        
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 bg-white shadow-lg rounded-xl p-10 ">
        
        {/* Image Section */}
        <div className="flex justify-center items-center ">
          <img
            src="https://cdn3.vectorstock.com/i/1000x1000/66/52/graphic-cartoon-character-contact-us-vector-35846652.jpg"
            alt="Contact Us"
            className="w-full h-auto"
          />
        </div>

        {/* Form Section */}
        <div className="flex flex-col justify-center space-y-4 ">
          <h1 className="text-3xl font-bold text-primary text-center">Get In Touch</h1>

          {successMessage && (
            <div className="text-green-700 bg-green-200 p-3 rounded-lg text-center font-semibold">
              {successMessage}
            </div>
          )}

          <div className= " p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-2 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-lg font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-2 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-lg font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  required
                  className="mt-2 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="w-full py-3 px-6 bg-primary text-white font-semibold text-lg rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out shadow-md"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
