import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper, Typography, Box, IconButton,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField, Button,
  FormControl, InputLabel, Select, MenuItem,
  Grid, Snackbar, Alert, styled
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { SwipeableList, SwipeableListItem, SwipeAction, TrailingActions } from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';
import { fetchAppointmentsByDateAndByLocation, fetchClinicLocations, updateAppointment, deleteAppointment } from '../api/userApi';
import { useAuth } from '../context/AuthContext';

// Styled components for enhanced visual appearance
const StyledTableRow = styled(TableRow)(({ theme, index }) => ({
  cursor: 'pointer',
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
  },
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
  },
  transition: 'background-color 0.2s ease',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5),
}));

const HeaderTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontWeight: 'bold',
}));

const ActionButton = styled(Button)(({ theme, color }) => ({
  backgroundColor: color === 'delete' ? theme.palette.error.main : theme.palette.primary.main,
  color: theme.palette.common.white,
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(0, 3),
  '&:hover': {
    backgroundColor: color === 'delete' ? theme.palette.error.dark : theme.palette.primary.dark,
  },
}));

const TabManage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [clinicLocations, setClinicLocations] = useState([]);
  const [selectedClinicLocation, setSelectedClinicLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const { user } = useAuth();

  // Fetch clinic locations only once when component mounts
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const locations = await fetchClinicLocations();
        setClinicLocations(locations);
      } catch (error) {
        setNotification({
          open: true,
          message: 'Failed to load clinic locations',
          severity: 'error'
        });
      }
    };

    loadLocations();
  }, []); // Empty dependency array means this runs once on mount

  // Memoized function to fetch appointments
  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAppointmentsByDateAndByLocation(selectedDate, selectedClinicLocation);
      setAppointments(data);
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to load appointments',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedClinicLocation]);

  // Fetch appointments when date or location changes
  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Handle date change
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  // Handle location change
  const handleLocationChange = (event) => {
    const value = event.target.value;
    if (value !== "none") {
      setSelectedClinicLocation(value);
    } else {
      setSelectedClinicLocation(null);
    }
  };

  // Handle row/appointment click - opens edit dialog
  const handleRowClick = (appointment) => {
    setCurrentAppointment({ ...appointment });
    setOpenDialog(true);
  };

  // Close edit dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentAppointment(null);
  };

  // Handle input changes in the edit dialog
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentAppointment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save appointment changes
  const handleSaveChanges = async () => {
    try {
      const currentUser = user?.displayName;

      // Prepare payload for API
      const payload = {
        id: currentAppointment.id,
        patientName: currentAppointment.patient_name,
        phoneNumber: currentAppointment.phone,
        status: currentAppointment.status,
        diagnosis: currentAppointment.diagnosis,
        notes: currentAppointment.notes,
        amount: currentAppointment.amount,
        physiotherapist: currentUser
      };

      const result = await updateAppointment(payload);

      if (result.success) {
        // Update the appointments list with updated data
        setAppointments(appointments.map(app =>
          app.id === currentAppointment.id ? currentAppointment : app
        ));

        setNotification({
          open: true,
          message: 'Appointment updated successfully',
          severity: 'success'
        });

        handleCloseDialog();
      } else {
        setNotification({
          open: true,
          message: result.error || 'Failed to update appointment',
          severity: 'error'
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to update appointment',
        severity: 'error'
      });
    }
  };

  // Delete appointment
  const handleDeleteClick = async (id) => {
    try {
      const result = await deleteAppointment(id);

      if (result.success) {
        setAppointments(appointments.filter(app => app.id !== id));

        setNotification({
          open: true,
          message: 'Appointment deleted successfully',
          severity: 'success'
        });
      } else {
        setNotification({
          open: true,
          message: result.error || 'Failed to delete appointment',
          severity: 'error'
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to delete appointment',
        severity: 'error'
      });
    }
  };

  // Delete action for swipeable list
  const getTrailingActions = (appointmentId) => (
    <TrailingActions>
      <SwipeAction
        destructive={true}
        onClick={() => {
          if (window.confirm('Are you sure you want to delete this appointment?')) {
            handleDeleteClick(appointmentId);
          }
        }}
      >
        <ActionButton color="delete">
          <DeleteIcon />
          Delete
        </ActionButton>
      </SwipeAction>
    </TrailingActions>
  );

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Format time for display (convert from UTC to local IST)
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Format to IST (UTC+5:30)
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  };

  // Determine if we should show swipeable list (mobile) or regular table (desktop)
  const isMobile = window.innerWidth < 768;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: '100%', p: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Manage Appointments
        </Typography>

        <Box sx={{
          mb: 3,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2,
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center'
        }}>
          <DatePicker
            label="Appointment Date"
            value={selectedDate}
            onChange={handleDateChange}
            sx={{ width: 220 }}
          />
          <FormControl sx={{ width: 220 }}>
            <InputLabel>Clinic Location</InputLabel>
            <Select
              name="ClinicLocation"
              label="Clinic Location"
              value={selectedClinicLocation || "none"}
              onChange={handleLocationChange}
            >
              <MenuItem value="none">All Locations</MenuItem>
              {clinicLocations.map((clinicLocation) => (
                <MenuItem key={clinicLocation.id} value={clinicLocation.id}>
                  {clinicLocation.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Typography>Loading appointments...</Typography>
        ) : appointments.length === 0 ? (
          <Typography sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            No appointments for this date.
          </Typography>
        ) : isMobile ? (
          // Mobile view with swipeable list
          <SwipeableList threshold={0.5}>
            {appointments.map((appointment, index) => (
              <SwipeableListItem
                key={appointment.id}
                trailingActions={getTrailingActions(appointment.id)}
              >
                <Paper
                  elevation={1}
                  sx={{
                    mb: 1,
                    p: 2,
                    borderLeft: `4px solid ${appointment.status === 'completed' ? 'success.main' :
                        appointment.status === 'cancelled' ? 'error.main' : 'primary.main'
                      }`,
                    backgroundColor: index % 2 === 0 ? 'background.paper' : 'action.hover'
                  }}
                  onClick={() => handleRowClick(appointment)}
                >
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {appointment.patient_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatTime(appointment.appointment_time)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">
                      Status: <b>{appointment.status}</b>
                    </Typography>                    
                  </Box>
                </Paper>
              </SwipeableListItem>
            ))}
          </SwipeableList>
        ) : (
          // Desktop view with table
          <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2, overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <HeaderTableCell>Patient Name</HeaderTableCell>
                  <HeaderTableCell>Time</HeaderTableCell>
                  <HeaderTableCell>Status</HeaderTableCell>
                  <HeaderTableCell>Actions</HeaderTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((appointment, index) => (
                  <StyledTableRow
                    key={appointment.id}
                    index={index}
                    onClick={() => handleRowClick(appointment)}
                  >
                    <StyledTableCell>{appointment.patient_name}</StyledTableCell>
                    <StyledTableCell>{formatTime(appointment.appointment_time)}</StyledTableCell>
                    <StyledTableCell>
                      <Box
                        component="span"
                        sx={{
                          py: 0.5,
                          px: 1,
                          borderRadius: 1,
                          backgroundColor:
                            appointment.status === 'completed' ? 'success.light' :
                              appointment.status === 'cancelled' ? 'error.light' : 'primary.light',
                          color:
                            appointment.status === 'completed' ? 'success.dark' :
                              appointment.status === 'cancelled' ? 'error.dark' : 'primary.dark',
                        }}
                      >
                        {appointment.status}
                      </Box>
                    </StyledTableCell>                    
                    <StyledTableCell>
                      <IconButton onClick={(e) => {
                        e.stopPropagation(); // Prevent row click
                        handleRowClick(appointment);
                      }} size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton onClick={(e) => {
                        e.stopPropagation(); // Prevent row click
                        if (window.confirm('Are you sure you want to delete this appointment?')) {
                          handleDeleteClick(appointment.id);
                        }
                      }} size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Edit Appointment Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
            Edit Appointment
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {currentAppointment && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Patient Name"
                    name="patient_name"
                    value={currentAppointment.patient_name || ''}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={currentAppointment.phone || ''}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={currentAppointment.status || ''}
                      onChange={handleInputChange}
                      label="Status"
                    >
                      <MenuItem value="scheduled">Scheduled</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Amount"
                    name="amount"
                    type="number"
                    value={currentAppointment.amount || ''}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Diagnosis"
                    name="diagnosis"
                    multiline
                    rows={2}
                    value={currentAppointment.diagnosis || ''}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    multiline
                    rows={3}
                    value={currentAppointment.notes || ''}
                    onChange={handleInputChange}
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} variant="outlined">Cancel</Button>
            <Button
              onClick={handleSaveChanges}
              variant="contained"
              color="primary"
              sx={{ minWidth: 100 }}
            >
              Save Changes
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
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            variant="filled"
            elevation={6}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default TabManage;