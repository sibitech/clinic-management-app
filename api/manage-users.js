const { getAllUsers, getUserByEmail, addAllowedUser, updateAllowedUser, deleteAllowedUser } = require('./db');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.body;

    switch (action) {
      case 'get-all-users':
        return handleGetAllUsers(req, res);
      case 'get-user-by-email':
        return handleGetUserByEmail(req, res);
      case 'add-user':
        return handleAddUser(req, res);
      case 'update-user':
        return handleUpdateUser(req, res);
      case 'delete-user':
        return handleDeleteUser(req, res);      
      default:
        return res.status(400).json({ error: 'Invalid action specified' });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all users
async function handleGetAllUsers(req, res) {
  const users = await getAllUsers();
  return res.status(200).json({ users });
}

// Get specific user
async function handleGetUserByEmail(req, res) {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  const user = await getUserByEmail(email);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  return res.status(200).json({ user });
}

// Add new user
async function handleAddUser(req, res) {
  const { email, is_admin = false } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email are required' });
  }
  
  try {
    const newUser = await addAllowedUser(email, is_admin);
    return res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.error('Error adding user:', error);
    return res.status(400).json({ success: false, error: error.message || 'Failed to add user' });
  }
}

// Update existing user
async function handleUpdateUser(req, res) {
  const { userId, email, is_admin } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  try {
    const updated = await updateAllowedUser(userId, email, is_admin);
    if (updated) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(400).json({ success: false, error: error.message || 'Failed to update user' });
  }
}

// Delete user
async function handleDeleteUser(req, res) {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  try {
    const deleted = await deleteAllowedUser(userId);
    if (deleted) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(400).json({ success: false, error: error.message || 'Failed to delete user' });
  }
}
