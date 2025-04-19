import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import BookIcon from '@mui/icons-material/MenuBook';
import ManageIcon from '@mui/icons-material/Settings';
import ReportIcon from '@mui/icons-material/Assessment';
import { AnimatePresence, motion } from 'framer-motion';
import './Home.css';
import TabBook from './TabBook';
import TabManage from './TabManage';
import TabReport from './TabReport';

const tabs = [<TabManage />, <TabBook />, <TabReport />];

function Home() {
  const { user, signOut } = useAuth();
  const [tabIndex, setTabIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleTabChange = (event, newValue) => {
    setDirection(newValue > tabIndex ? 1 : -1);
    setTabIndex(newValue);
  };

  return (
    <div className="home-container">
      <header className="app-header">
        <h1>Physio One Cbe</h1>
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
        </div>

        {/* Updated Section Starts Here */}
        <div className="app-main-content" style={{ paddingBottom: '80px' }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tabIndex}
              initial={{ x: direction * 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction * -100, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {tabs[tabIndex]}
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Updated Section Ends Here */}
      </main>

      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation value={tabIndex} onChange={handleTabChange}>
          <BottomNavigationAction label="Manage" icon={<ManageIcon />} />
          <BottomNavigationAction label="Book" icon={<BookIcon />} />
          <BottomNavigationAction label="Report" icon={<ReportIcon />} />
        </BottomNavigation>
      </Paper>
    </div>
  );
}

export default Home;
