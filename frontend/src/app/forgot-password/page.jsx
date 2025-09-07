'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MainNavbar from '@/components/MainNavbar';
import Footer from '@/components/Footer';
import axios from 'axios';
import Image from 'next/image';

const ResetPassword = () => {
  const router = useRouter();
  // const searchParams = useSearchParams();
  // const email = searchParams.get('email') || '';
  // const otp = searchParams.get('otp') || '';

  const [newpassword, setNewPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("reset_email");
    console.log("Saved Email:", savedEmail);
    if (!savedEmail) {
      router.push("/login"); // if no email, redirect
    } else {
      setEmail(savedEmail);
    }
  },[]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newpassword || !confirmpassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (newpassword !== confirmpassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    
    try {
      console.log('Email:', email);
      console.log('New Password:', newpassword);    
      console.log('Confirm Password:', confirmpassword);
      const response = await axios.post("http://127.0.0.1:8000/api/accounts/reset-password", {email, newpassword, confirmpassword});
      if(response.status == 200) {
        console.log("Password changed successfully");
        alert("Password changed successfully");
      }
      setSuccess('Password changed successfully!');
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <MainNavbar />
      <div className="min-h-screen flex items-center justify-center mt-8">
        
        {/* Left Side - Image */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 bg-white shadow-xl rounded-lg p-10">
        <div className='flex justify-center items-center'>
          <Image
            src="https://img.freepik.com/premium-vector/forgot-password-concept-illustration_114360-1123.jpg"
            alt="Reset Password Illustration"
            width={600}
              height={600}
            className="object-contain max-h-[80vh]"
            priority
          />
        </div>
          
        

        {/* Right Side - Form */}
      
          <div className="flex flex-col justify-center space-y-6">
            <h2 className="text-2xl font-bold text-primary text-center mb-4">Reset Password</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newpassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password</label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={confirmpassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-red-600 text-sm text-center">{error}</p>}
              {success && <p className="text-green-600 text-sm text-center">{success}</p>}

              <button
                type="submit"
                className="w-full bg-primary text-white py-2 rounded hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ResetPassword;
