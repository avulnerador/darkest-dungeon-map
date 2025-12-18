
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MasterView from './pages/MasterView';
import PlayerView from './pages/PlayerView';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MasterView />} />
      <Route path="/player" element={<PlayerView />} />
    </Routes>
  );
};

export default App;
