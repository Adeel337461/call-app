// src/pages/home.jsx
import React, {
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem("userName") || "You";
    setUserName(name);
   
  }, [navigate]);


  const [userName, setUserName] = useState("");
  const logout = () => {
    localStorage.removeItem('accesstoken');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const createRoom = () => {
    const roomId = uuidv4();
  navigate(`/room/${roomId}`);
  };

  const joinRoom = () => {
    const roomId = prompt('Enter Room ID:');
    if (roomId) {
      navigate(`/room/${roomId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-6 p-4">
      <h1 className="text-3xl font-semibold mb-4">Video Call</h1>

      <div className="text-center space-y-1">
        <p>
          Welcome, <span className="font-semibold">{userName}</span>
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={createRoom}
          className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400"
        >
          Create New Room
        </button>

        <button
          onClick={joinRoom}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400"
        >
          Join Room by ID
        </button>
      </div>

      <button
        onClick={logout}
        className="mt-6 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400"
      >
        Logout
      </button>
    </div>
  );
};

export default Home;
