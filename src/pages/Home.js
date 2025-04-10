import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Home.css';

function Home() {
  const { user, signOut } = useAuth();

  return (
    <div className="home-container">
      <header className="app-header">
        <h1>Welcome to the App</h1>
        <div className="user-profile">
          {user?.photoURL && (
            <img 
              src={user.photoURL} 
              alt={user.displayName || 'User'} 
              className="user-avatar" 
            />
          )}
          <span className="user-name">{user?.displayName}</span>
          <button onClick={signOut} className="sign-out-button">
            Sign Out
          </button>
        </div>
      </header>
      <main className="app-content">
        <div className="welcome-message">
          <h2>Hello, {user?.displayName}!</h2>
          <p>You've successfully logged in to the protected application.</p>
        </div>
        
        {/* Your app content goes here */}
        <div className="app-main-content">
          <p>This is your protected homepage. Your content will go here.</p>
        </div>
      </main>
    </div>
  );
}

export default Home;