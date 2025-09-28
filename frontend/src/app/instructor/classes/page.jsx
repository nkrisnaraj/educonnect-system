'use client';

import { useState, useEffect } from 'react';
import { useInstructorApi } from '@/hooks/useInstructorApi';

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const instructorApi = useInstructorApi();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching classes data...');
      const response = await instructorApi.getClasses();
      console.log('API Response:', response);
      
      if (response && response.classes) {
        console.log('Found classes:', response.classes.length);
        console.log('First class sample:', response.classes[0]);
        setClasses(response.classes || []);
      } else if (response) {
        // Handle case where response is direct array
        console.log('Response is direct array:', Array.isArray(response));
        console.log('Response sample:', response[0]);
        setClasses(Array.isArray(response) ? response : []);
      } else {
        console.log('No response received');
        setError('Failed to fetch classes');
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Classes</h1>
      
      {classes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white border rounded-lg shadow-sm h-full">
              <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold mb-1 truncate">
                      {cls.title || 'Unnamed Class'}
                    </h3>
                    <span className="text-sm text-gray-500 break-all">
                      {cls.classid || 'No ID'}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    cls.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : cls.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {cls.status || 'Unknown'}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 text-sm overflow-hidden" style={{display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical'}}>
                  {cls.description || 'No description provided'}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Fee:</span>
                    <span className="ml-1 font-medium">${cls.fee || '0'}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-gray-500">Instructor:</span>
                    <span className="ml-1 font-medium">{cls.instructor_name || 'Unknown'}</span>
                  </div>
                </div>

                {cls.start_date && cls.end_date && (
                  <div className="text-sm text-gray-500 mb-2">
                    Duration: {new Date(cls.start_date).toLocaleDateString()} - {new Date(cls.end_date).toLocaleDateString()}
                  </div>
                )}

                {cls.schedules && cls.schedules.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100 text-sm text-gray-600">
                    <strong>Schedules:</strong>
                    <div className="mt-1 space-y-1 max-h-20 overflow-y-auto pr-1">
                      {cls.schedules.map((schedule, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span>{schedule.start_time} ({schedule.duration_minutes}m)</span>
                          <span className="text-gray-500 truncate ml-2">{schedule.days_of_week?.join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {cls.webinar_info && (
                  <div className="mt-2 pt-2 border-t border-gray-100 text-sm text-gray-700">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">Webinar:</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-mono">
                        {cls.webinar_info.webinar_id}
                      </span>
                    </div>
                    <div className="space-y-1 text-gray-600">
                      <div><strong>Topic:</strong> {cls.webinar_info.topic}</div>
                      {cls.webinar_info.start_time && (
                        <div><strong>Time:</strong> {new Date(cls.webinar_info.start_time).toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                )}

                {cls.webinar_info?.registration_url && (
                  <div className="mt-auto pt-4">
                    <a 
                      href={cls.webinar_info.registration_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                    >
                      Register for Webinar
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-gray-500 text-lg">No classes found</h3>
          <p className="text-gray-400">Create your first class to get started</p>
        </div>
      )}
    </div>
  );
}
