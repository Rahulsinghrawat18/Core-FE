import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lobby from './Lobby';
import Board from './Board';
import HowToPlay from './HowToPlay';
import { io } from "socket.io-client";

import { AppProvider } from './Context.tsx'; 
import Skins from './Skins';

const serverURL = "https://core-server-wxr9.onrender.com"
//const serverURL = "http://localhost:3000"
const socket = io(serverURL);


function App() {
  return (
    <AppProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Lobby socket={socket} />} />
        <Route path="/board" element={<Board socket={socket} />} />
        <Route path="/how-to-play" element={<HowToPlay />} /> 
        <Route path="/skins" element={<Skins />} />
      </Routes>
    </Router>
    </AppProvider>
  );
}

export default App;
