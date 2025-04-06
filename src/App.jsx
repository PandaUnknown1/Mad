import React, { useState, useEffect } from 'react';

const USERS = ['you', 'her'];
const STATUS_KEY = 'mad-status';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [mad, setMad] = useState(false);
  const [reason, setReason] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [statusData, setStatusData] = useState({});

  // Load saved data
  useEffect(() => {
    const savedStatus = JSON.parse(localStorage.getItem(STATUS_KEY)) || {};
    setStatusData(savedStatus);
  }, []);

  // Save changes
  useEffect(() => {
    if (screen === 'user') {
      const updated = {
        ...statusData,
        [currentUser]: { mad, reason, suggestion },
      };
      localStorage.setItem(STATUS_KEY, JSON.stringify(updated));
      setStatusData(updated);
    }
  }, [mad, reason, suggestion]);

  const handleLogin = async (user) => {
    const storedPassword = localStorage.getItem(`${user}-password`);
    if (!storedPassword) {
      const newPass = prompt(`Set a password for ${user}`);
      if (newPass) {
        localStorage.setItem(`${user}-password`, newPass);
        alert('Password set!');
      } else return;
    } else {
      const input = prompt(`Enter password for ${user}`);
      if (input !== storedPassword) {
        alert('Wrong password!');
        return;
      }
    }

    setCurrentUser(user);
    const data = statusData[user] || { mad: false, reason: '', suggestion: '' };
    setMad(data.mad);
    setReason(data.reason);
    setSuggestion(data.suggestion);
    setScreen('user');
  };

  const handleStatusView = () => {
    const input = prompt('Enter status page password:');
    if (input === localStorage.getItem('Miloisacat')) {
      setScreen('status');
    } else {
      alert('Wrong password!');
    }
  };

  const handleReset = () => {
    const cleared = {
      ...statusData,
      you: { mad: false, reason: '', suggestion: '' },
      her: { mad: false, reason: '', suggestion: '' },
    };
    localStorage.setItem(STATUS_KEY, JSON.stringify(cleared));
    setStatusData(cleared);
  };

  if (screen === 'home') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-pink-100 space-y-4">
        <h1 className="text-4xl font-bold text-pink-700 mb-8">How Are We Feeling? </h1>
        <button className="bg-pink-500 text-white px-6 py-3 rounded-full" onClick={() => handleLogin('you')}>Krishraj 🐼</button>
        <button className="bg-pink-500 text-white px-6 py-3 rounded-full" onClick={() => handleLogin('her')}>Asfia 🐱</button>
        <button className="bg-purple-600 text-white px-6 py-3 rounded-full mt-8" onClick={handleStatusView}>View Status</button>
      </div>
    );
  }

  if (screen === 'user') {
    return (
      <div className="min-h-screen bg-pink-50 flex flex-col items-center py-10 px-4">
        <h2 className="text-2xl font-bold mb-4 capitalize">{currentUser}'s Mood</h2>

        <label className="flex items-center space-x-3 mb-4">
          <span className="text-lg">Are you mad?</span>
          <input type="checkbox" checked={mad} onChange={(e) => setMad(e.target.checked)} />
        </label>

        <textarea
          placeholder="Why are you mad?"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full max-w-md h-24 p-2 border border-gray-300 rounded mb-4"
        />

        <textarea
          placeholder="How can it be better?"
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
          className="w-full max-w-md h-24 p-2 border border-gray-300 rounded mb-4"
        />

        <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded" onClick={() => setScreen('home')}>
          Save & Go Home
        </button>
      </div>
    );
  }

  if (screen === 'status') {
    return (
      <div className="min-h-screen bg-white p-6 text-center">
        <h1 className="text-3xl font-bold text-purple-700 mb-6">❤️ Status Overview ❤️</h1>

        {USERS.map((u) => (
          <div key={u} className="mb-6 border-t border-gray-300 pt-4">
            <h2 className="text-xl font-semibold capitalize text-pink-700">{u}</h2>
            <p><strong>Mad:</strong> {statusData[u]?.mad ? 'Yes 😡' : 'No 😊'}</p>
            <p><strong>Reason:</strong> {statusData[u]?.reason || 'None'}</p>
            <p><strong>Suggestion:</strong> {statusData[u]?.suggestion || 'None'}</p>
          </div>
        ))}

        <button className="mt-6 bg-red-500 text-white px-4 py-2 rounded" onClick={handleReset}>
          Reset Status
        </button>

        <button className="mt-2 bg-gray-400 text-white px-4 py-2 rounded ml-4" onClick={() => setScreen('home')}>
          Back to Home
        </button>
      </div>
    );
  }

  return null;
}
