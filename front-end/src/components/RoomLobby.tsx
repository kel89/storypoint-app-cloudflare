import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";

function generateRoomId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export default function RoomLobby() {
  const [joinId, setJoinId] = useState("");
  const navigate = useNavigate();

  const createRoom = () => {
    const roomId = generateRoomId();
    navigate(`/room/${roomId}`);
  };

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = joinId.trim();
    if (trimmed) {
      navigate(`/room/${trimmed}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <DarkModeToggle />
      <h1 className="text-4xl font-bold mb-2 dark:text-white">Storypointer</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Real-time story point voting</p>

      <button
        onClick={createRoom}
        className="px-6 py-3 bg-blue-500 text-white text-lg rounded hover:bg-blue-700 transition-colors mb-8"
      >
        Create New Room
      </button>

      <div className="text-gray-400 dark:text-gray-500 mb-4">or join an existing room</div>

      <form onSubmit={joinRoom} className="flex gap-2">
        <input
          type="text"
          value={joinId}
          onChange={(e) => setJoinId(e.target.value)}
          placeholder="Room ID"
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-white"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-gray-600 dark:bg-gray-500 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-400 transition-colors"
        >
          Join
        </button>
      </form>
    </div>
  );
}
