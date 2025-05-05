"use client";

import { useState, useEffect } from 'react';
import { getSocket } from '../../lib/socket';

export default function SocketTestPage() {
  const [socketId, setSocketId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [testMessage, setTestMessage] = useState('');
  const [testRoom, setTestRoom] = useState('test-room');

  useEffect(() => {
    // Get the socket connection
    const socket = getSocket();
    
    // Log connection events
    const logEvent = (event, data) => {
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      setLogs(prev => [...prev, `${timestamp} | ${event} | ${JSON.stringify(data)}`]);
    };
    
    socket.on('connect', () => {
      setConnected(true);
      setSocketId(socket.id);
      logEvent('connect', { id: socket.id });
    });
    
    socket.on('disconnect', (reason) => {
      setConnected(false);
      setSocketId(null);
      logEvent('disconnect', { reason });
    });
    
    socket.on('connect_error', (err) => {
      setError(err.message);
      logEvent('connect_error', { message: err.message });
    });
    
    // Custom test events
    socket.on('test_response', (data) => {
      logEvent('test_response', data);
    });
    
    socket.on('joined', (data) => {
      logEvent('joined', data);
    });
    
    socket.on('new_message', (data) => {
      logEvent('new_message', data);
    });
    
    // Cleanup
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('test_response');
      socket.off('joined');
      socket.off('new_message');
    };
  }, []);
  
  // Test socket connection by sending a ping
  const testConnection = () => {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('ping', { time: new Date().toISOString() });
      const log = `${new Date().toISOString().split('T')[1].split('.')[0]} | sent | ping`;
      setLogs(prev => [...prev, log]);
    } else {
      setError('Socket not connected');
    }
  };
  
  // Join a test room
  const joinRoom = () => {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('join', testRoom);
      const log = `${new Date().toISOString().split('T')[1].split('.')[0]} | sent | join ${testRoom}`;
      setLogs(prev => [...prev, log]);
    } else {
      setError('Socket not connected');
    }
  };
  
  // Send a test message
  const sendTestMessage = () => {
    const socket = getSocket();
    if (!testMessage.trim()) {
      setError('Message cannot be empty');
      return;
    }
    
    if (socket.connected) {
      const messageData = {
        content: testMessage,
        conversationId: testRoom,
        senderId: 'test-user',
        senderName: 'Test User',
        isOwner: false,
      };
      
      socket.emit('send_message', messageData);
      const log = `${new Date().toISOString().split('T')[1].split('.')[0]} | sent | message to ${testRoom}: ${testMessage}`;
      setLogs(prev => [...prev, log]);
      setTestMessage('');
    } else {
      setError('Socket not connected');
    }
  };
  
  // Clear logs
  const clearLogs = () => {
    setLogs([]);
  };
  
  // Reconnect socket
  const reconnect = () => {
    const socket = getSocket();
    socket.disconnect();
    setTimeout(() => {
      socket.connect();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Socket.IO Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className={`w-3 h-3 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="font-medium">
              {connected ? 'Connected' : 'Disconnected'}
              {socketId && ` (ID: ${socketId})`}
            </span>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}
          
          <div className="flex space-x-2 mb-6">
            <button 
              onClick={testConnection}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test Connection
            </button>
            <button 
              onClick={reconnect}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Reconnect
            </button>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Join Room</h2>
            <div className="flex space-x-2">
              <input
                type="text"
                value={testRoom}
                onChange={(e) => setTestRoom(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2"
                placeholder="Room name"
              />
              <button 
                onClick={joinRoom}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Join
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Send Test Message</h2>
            <div className="flex space-x-2">
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2"
                placeholder="Test message"
              />
              <button 
                onClick={sendTestMessage}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Event Logs</h2>
            <button 
              onClick={clearLogs}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
          
          <div className="bg-gray-100 rounded p-4 h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-500">No events logged yet</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}