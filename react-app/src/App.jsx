import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DiagramPage from './pages/DiagramPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/diagram/:lineKind" element={<DiagramPage />} />
      </Routes>
    </Router>
  );
}

export default App;
