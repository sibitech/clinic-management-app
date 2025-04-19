import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, Box, Button, IconButton,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField, FormControlLabel,
  Checkbox, Snackbar, Alert, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchAllUsers, updateUser, deleteUser, addUser } from '../api/userApi';

const TabManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [currentUser, setCurrentUser] = useState({ email: '', is_admin: false });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to load users',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewClick = () => {
    setCurrentUser({ email: '', isAdmin: false });
    setIsNewUser(true);
    setOpenDialog(true);
  };

  const handleEditClick = (user) => {
    setCurrentUser({ ...user });
    setIsNewUser(false);
    setOpenDialog(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const result = await deleteUser(id);
        if (result.success) {
          setUsers(users.filter(user => user.id !== id));
          setNotification({
            open: true,
            message: 'User deleted successfully',
            severity: 'success'
          });
        } else {
          setNotification({
            open: true,
            message: result.error || 'Failed to delete user',
            severity: 'error'
          });
        }
      } catch (error) {
        setNotification({
          open: true,
          message: 'Failed to delete user',
          severity: 'error'
        });
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setCurrentUser(prev => ({
      ...prev,
      [name]: name === 'is_admin' ? checked : value
    }));
  };

  const handleSaveUser = async () => {
    try {
      let result;
      if (isNewUser) {
        result = await addUser(currentUser);
      } else {
        result = await updateUser(currentUser);
      }

      if (result.success) {
        await loadUsers(); // Reload all users
        setNotification({
          open: true,
          message: `User ${isNewUser ? 'added' : 'updated'} successfully`,
          severity: 'success'
        });
        handleCloseDialog();
      } else {
        setNotification({
          open: true,
          message: result.error || `Failed to ${isNewUser ? 'add' : 'update'} user`,
          severity: 'error'
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to ${isNewUser ? 'add' : 'update'} user`,
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Manage Users
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddNewClick}
        >
          Add New User
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Typography>No users found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Actions</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Admin</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <IconButton onClick={() => handleEditClick(user)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(user.id)} size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.is_admin ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{isNewUser ? 'Add New User' : 'Edit User'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Email"
            name="email"
            value={currentUser.email || ''}
            onChange={handleInputChange}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={currentUser.is_admin || false}
                onChange={handleInputChange}
                name="is_admin"
              />
            }
            label="Is Admin"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TabManageUsers;