import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import LandingScreen from './screens/LandingScreen';
import GameScreen from './screens/GameScreen';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-nairobi-yellow selection:text-nairobi-black">
        <Routes>
          <Route path="/" element={<LandingScreen />} />
          <Route path="/game" element={<GameScreen />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;