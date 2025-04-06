import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const USERS = ['you', 'her'];

export default function App() {
  const [screen, setScreen] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [mad, setMad] = useState(false);
  const [reason, setReason] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [statusData, setStatusData] = useState({});

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'status', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setStatusData(docSnap.data());
      }
    });
    return () => unsub();
  }, []);

  const handleLogin = async (user) => {
    const passwordRef = doc(db, 'passwords', user);
    const docSnap = await getDoc(passwordRef);

    if (!docSnap.exists()) {
      const newPass = prompt(`Set a password for ${user}`);
      if (newPass) {
        await setDoc(passwordRef, { password: newPass });
        alert('Password set!');
      } else return;
    } else {
      const input = prompt(`Enter password for ${user}`);
      const savedPassword = docSnap.data().password;
      if (input !== savedPassword) {
        alert('Wrong password!');
        return;
      }
    }

    setCurrentUser(user);
    const userData = statusData[user] || { mad: false, reason: '', suggestion: '', madSince: null };
    setMad(userData.mad);
    setReason(userData.reason);
    setSuggestion(userData.suggestion);
    setScreen('user');
  };

  useEffect(() => {
    if (!currentUser) return;
    const updateStatus = async () => {
      const updated = {
        ...statusData,
        [currentUser]: {
          mad,
          reason,
          suggestion,
          madSince: mad ? new Date().toISOString() : null,
        },
        notification: {
          from: currentUser,
          timestamp: new Date().toISOString(),
        },
      };
      await setDoc(doc(db, 'status', 'global'), updated);
    };
    updateStatus();
  }, [mad, reason, suggestion]);

  const handleStatusView = async () => {
    const passwordRef = doc(db, 'passwords', 'status');
    const docSnap = await getDoc(passwordRef);

    if (!docSnap.exists()) {
      const newPassword = prompt('Set a password for the status page:');
      if (newPassword) {
        await setDoc(passwordRef, { password: newPassword });
        alert('Password set! You can now access the status page.');
        setScreen('status');
      }
    } else {
      const input = prompt('Enter status page password:');
      if (input === docSnap.data().password) {
        setScreen('status');
      } else {
        alert('Wrong password!');
      }
    }
  };

  const resetUserStatus = async () => {
    const updated = {
      ...statusData,
      [currentUser]: { mad: false, reason: '', suggestion: '', madSince: null },
      notification: {
        from: currentUser,
        timestamp: new Date().toISOString(),
      },
    };
    await setDoc(doc(db, 'status', 'global'), updated);
    setMad(false);
    setReason('');
    setSuggestion('');
  };

  const formatDuration = (isoTime) => {
    if (!isoTime) return '';
    const diff = Date.now() - new Date(isoTime).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    if (hours > 0) return `${hours}h ${mins % 60}m ago`;
    return `${mins} minute(s) ago`;
  };

  if (screen === 'home') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-pink-100 space-y-4">
        <h1 className="text-4xl font-bold text-pink-700 mb-8">How Are We Feeling?</h1>
        <button className="bg-pink-500 text-white px-6 py-3 rounded-full" onClick={() => handleLogin('you')}>Krishraj 🐼</button>
        <button className="bg-pink-500 text-white px-6 py-3 rounded-full" onClick={() => handleLogin('her')}>Asfia 🐱</button>
        <button className="bg-purple-600 text-white px-6 py-3 rounded-full mt-8" onClick={handleStatusView}>View Status</button>
      </div>
    );
  }

  if (screen === 'user') {
    return (
      <div className="min-h-screen bg-pink-50 flex flex-col items-center py-10 px-4">
        <h2 className="text-2xl font-bold mb-4 capitalize">{currentUser === 'you' ? 'Krishraj 🐼' : 'Asfia 🐱'}'s Mood</h2>

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

        <button className="mt-2 bg-red-500 text-white px-4 py-2 rounded" onClick={resetUserStatus}>
          Reset My Status
        </button>
      </div>
    );
  }

  if (screen === 'status') {
    const users = [
      { key: 'you', label: 'Krishraj 🐼' },
      { key: 'her', label: 'Asfia 🐱' },
    ];

    return (
      <div className="min-h-screen bg-white p-6 text-center">
        <h1 className="text-3xl font-bold text-purple-700 mb-6">Status Overview</h1>

        {users.map(({ key, label }) => (
          <div key={key} className="mb-6 border-t border-gray-300 pt-4">
            <h2 className="text-xl font-semibold text-pink-700">{label}</h2>
            <p><strong>Mad:</strong> {statusData[key]?.mad ? 'Yes 😡' : 'No 😊'}</p>
            <p><strong>Reason:</strong> {statusData[key]?.reason || 'None'}</p>
            <p><strong>Suggestion:</strong> {statusData[key]?.suggestion || 'None'}</p>
            {statusData[key]?.mad && (
              <p><strong>Mad Since:</strong> {formatDuration(statusData[key].madSince)}</p>
            )}
          </div>
        ))}

        <button className="mt-4 bg-gray-500 text-white px-4 py-2 rounded" onClick={() => setScreen('home')}>
          Back to Home
        </button>
      </div>
    );
  }

  return null;
}
