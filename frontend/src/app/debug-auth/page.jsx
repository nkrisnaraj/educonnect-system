import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function DebugAuthPage() {
  const { user, accessToken, logout } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testAdminEndpoint = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      console.log('Testing with token:', token ? `${token.substring(0, 20)}...` : 'none');
      
      const response = await axios.get('http://127.0.0.1:8000/edu_admin/admin-test/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setTestResult({ success: true, data: response.data });
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult({ 
        success: false, 
        error: error.response?.data || error.message,
        status: error.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Debug Auth Page - User:', user);
    console.log('Debug Auth Page - Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'none');
    console.log('Debug Auth Page - SessionStorage:', {
      user: sessionStorage.getItem('user') ? 'exists' : 'none',
      token: sessionStorage.getItem('accessToken') ? 'exists' : 'none',
      role: sessionStorage.getItem('userRole')
    });
  }, [user, accessToken]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Page</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Auth Context State:</h2>
          <pre className="text-sm">
            {JSON.stringify({
              hasUser: !!user,
              userRole: user?.role,
              hasToken: !!accessToken,
              tokenLength: accessToken?.length
            }, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Session Storage:</h2>
          <pre className="text-sm">
            {JSON.stringify({
              user: sessionStorage.getItem('user') ? 'exists' : 'none',
              userRole: sessionStorage.getItem('userRole'),
              accessToken: sessionStorage.getItem('accessToken') ? 'exists' : 'none',
              refreshToken: sessionStorage.getItem('refreshToken') ? 'exists' : 'none'
            }, null, 2)}
          </pre>
        </div>

        <div className="space-x-4">
          <button
            onClick={testAdminEndpoint}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Admin Endpoint'}
          </button>
          
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {testResult && (
          <div className={`p-4 rounded ${testResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <h2 className="font-semibold mb-2">Test Result:</h2>
            <pre className="text-sm">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
