import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './Home';
import Transaction from './Transaction';
import Storage from './Storage';
import Login from './Login'; // Import the Login component
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        
        <Routes>
          <Route path="/" element={<Login />} /> {/* Login page route */}
          <Route path="/home" element={<Home />} /> {/* Home page route */}
          <Route path="/transaction" element={<Transaction />} />
          <Route path="/storage" element={<Storage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;