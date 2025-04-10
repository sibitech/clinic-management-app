import React from 'react';
import { useAuth } from '../context/AuthContext';
import './AccessDenied.css';

function AccessDenied() {
  const { user, signOut } = useAuth();

  return (
    <div className="access-denied-container">
      <div className="access-denied-card">
        <div className="access-denied-icon">
          <svg viewBox="0 0 24 24" width="64" height="64">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          </svg>
        </div>
        <h1>Access Denied</h1>
        <p>Sorry, you don't have permission to access this application.</p>
        <p className="email">Email: {user?.email}</p>
        <p className="help-text">If you believe this is a mistake, please contact the administrator.</p>
        <button onClick={signOut} className="sign-out-button">
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default AccessDenied;