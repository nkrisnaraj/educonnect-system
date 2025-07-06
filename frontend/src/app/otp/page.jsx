'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import MainNavbar from '@/components/MainNavbar';
import axios from 'axios';
import Footer from '@/components/Footer';

const VerifyOtp = () => {
  // const searchParams = useSearchParams();
  // const email = searchParams.get('email') || '';
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("reset_email");
    console.log("Saved Email:", savedEmail);
    if (!savedEmail) {
      router.push("/login"); // if no email, redirect
    } else {
      setEmail(savedEmail);
    }
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    if (!email) {
      alert("Please enter a valid email");
      return;
    }
    setIsLoading(true);
    console.log('Email:', email);
    console.log('OTP:', otp);
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/accounts/verify-otp/", {email,otp})
      if(response.status == 200) {
        router.push("/forgot-password")
      }  
    } catch {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
        const response = await axios.post("http://127.0.0.1:8000/api/accounts/send-otp/",{ email });

        if (response.status === 200) {
          alert("Check your email address for the OTP.");
        }
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.error || "Failed to send OTP.");
      }
  };

  return (
    <>
      <MainNavbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
          <div className="text-center mb-6 gap-6">
            <h2 className="text-2xl font-semibold">Verify OTP</h2>
            <p className="text-sm text-gray-600 mt-4">
             Please enter the verification code that was sent to your email.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex justify-center gap-2">
              {[...Array(6)].map((_, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength="1"
                  className="w-10 h-12 border border-gray-300 rounded text-center text-lg"
                  value={otp[i] || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    if (val.length <= 1) {
                      const newOtp = otp.split('');
                      newOtp[i] = val;
                      setOtp(newOtp.join(''));
                    }
                  }}
                />
              ))}
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>

            <div className="text-center space-y-2">
              <p className="text-sm font-bold text-gray-600">Didn't receive the code?</p>
              {timer > 0 ? (
                <p className="text-sm text-gray-500">Resend in {timer} seconds</p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {resendLoading ? 'Sending...' : 'Resend Code'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default VerifyOtp;
