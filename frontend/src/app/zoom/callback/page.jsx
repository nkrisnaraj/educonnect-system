"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

export default function ZoomCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Processing Zoom authentication...");

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");

      if (error) {
        setStatus("error");
        setMessage(`Zoom authentication failed: ${error}`);
        return;
      }

      if (!code) {
        setStatus("error");
        setMessage("No authorization code received from Zoom");
        return;
      }

      try {
        // Call your backend to handle the callback
        const response = await axios.get(`/api/accounts/zoom/callback/?code=${code}&state=${state}`);
        
        if (response.data.success) {
          setStatus("success");
          setMessage("Zoom account verified successfully!");
          
          // Redirect back to registration page with verification status
          setTimeout(() => {
            router.push(`/register?zoom_verified=true&email=${encodeURIComponent(response.data.email)}`);
          }, 2000);
        } else {
          setStatus("error");
          setMessage(response.data.error || "Zoom verification failed");
        }
      } catch (error) {
        setStatus("error");
        setMessage(error.response?.data?.error || "Failed to verify Zoom account");
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          {status === "processing" && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing...</h2>
            </>
          )}
          
          {status === "success" && (
            <>
              <div className="rounded-full h-12 w-12 bg-green-100 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-green-900 mb-2">Success!</h2>
            </>
          )}
          
          {status === "error" && (
            <>
              <div className="rounded-full h-12 w-12 bg-red-100 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-red-900 mb-2">Error</h2>
            </>
          )}
          
          <p className="text-gray-600">{message}</p>
          
          {status === "success" && (
            <p className="text-sm text-gray-500 mt-2">Redirecting you back to registration...</p>
          )}
          
          {status === "error" && (
            <button
              onClick={() => router.push("/register")}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
            >
              Back to Registration
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
