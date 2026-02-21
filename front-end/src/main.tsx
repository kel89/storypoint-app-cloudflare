import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import RoomLobby from "./components/RoomLobby.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoomLobby />} />
        <Route path="/room/:roomId" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
