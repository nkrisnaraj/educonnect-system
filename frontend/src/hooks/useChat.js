import { useState, useEffect, useRef } from 'react';
import api from '@/services/api';

export const useChat = (roomId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const ws = useRef(null);

  // Fetch chat history
  const fetchMessages = async () => {
    if (!roomId) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/api/students/chat/rooms/${roomId}/messages/`);
      setMessages(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async (content) => {
    if (!roomId || !content.trim()) return;

    try {
      const response = await api.post(`/api/students/chat/rooms/${roomId}/messages/`, {
        content: content.trim()
      });
      
      // Add message to local state
      setMessages(prev => [...prev, response.data]);
      return true;
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
      return false;
    }
  };

  // WebSocket connection for real-time messages
  const connectWebSocket = () => {
    if (!roomId) return;

    const wsUrl = `ws://localhost:8000/ws/chat/${roomId}/`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setConnected(true);
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, data.message]);
    };

    ws.current.onclose = () => {
      setConnected(false);
      console.log('WebSocket disconnected');
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error');
    };
  };

  // Disconnect WebSocket
  const disconnectWebSocket = () => {
    if (ws.current) {
      ws.current.close();
    }
  };

  // Initialize chat
  useEffect(() => {
    if (roomId) {
      fetchMessages();
      connectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [roomId]);

  return {
    messages,
    loading,
    error,
    connected,
    sendMessage,
    fetchMessages,
    connectWebSocket,
    disconnectWebSocket,
  };
};

export default useChat;