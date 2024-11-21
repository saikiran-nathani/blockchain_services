import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-container">
      <h1>Welcome to the Blockchain App</h1>
      <p className="description">Effortlessly manage transactions and store data securely on the blockchain.</p>
      <div className="home-options">
        <Link to="/transaction" className="nav-link">
          <button>Transactions</button>
        </Link>
        <Link to="/storage" className="nav-link">
          <button>Storage</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;