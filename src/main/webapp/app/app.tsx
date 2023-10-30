import { BrowserRouter, Route, Routes } from 'react-router-dom';

import './App.css';
import React from 'react';
import Launch from './launch';
import Main from './main';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/launch" element={<Launch />} />
        <Route path="/" element={<Main />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
