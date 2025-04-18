import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography, Box, Card, CardContent,
  Grid, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { fetchAppointmentsByDateAndByLocation, fetchClinicLocations } from '../api/userApi';

const TabReports = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [clinicLocations, setClinicLocations] = useState([]);
  const [selectedClinicLocation, setSelectedClinicLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    totalEarnings: 0
  });

  // Fetch clinic locations only once when component mounts
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const locations = await fetchClinicLocations();
        setClinicLocations(locations);
      } catch (error) {
        console.error('Failed to load clinic locations', error);
      }
    };

    loadLocations();
  }, []);

  // Memoized function to fetch appointments and calculate report data
  const loadReportData = useCallback(async () => {
    setLoading(true);
    try {
      const appointments = await fetchAppointmentsByDateAndByLocation(selectedDate, selectedClinicLocation);
      
      // Calculate statistics
      const stats = {
        scheduled: 0,
        completed: 0,
        cancelled: 0,
        totalEarnings: 0
      };
      
      appointments.forEach(appointment => {
        // Count appointments by status
        if (appointment.status === 'scheduled') {
          stats.scheduled++;
        } else if (appointment.status === 'completed') {
          stats.completed++;
          // Only add to earnings if the appointment is completed
          stats.totalEarnings += parseFloat(appointment.amount || 0);
        } else if (appointment.status === 'cancelled') {
          stats.cancelled++;
        }
      });
      
      setReportData(stats);
    } catch (error) {
      console.error('Failed to load report data', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedClinicLocation]);

  // Fetch report data when date or location changes
  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

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

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          Appointment Reports
        </Typography>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <DatePicker
            label="Report Date"
            value={selectedDate}
            onChange={handleDateChange}
            sx={{ width: 220 }}
          />
          <FormControl sx={{ width: 220 }}>
            <InputLabel>Clinic Location</InputLabel>
            <Select
              name="clinicLocation"
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
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Appointment Status
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {reportData.scheduled}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          Scheduled
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          {reportData.completed}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          Completed
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="error.main">
                          {reportData.cancelled}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          Cancelled
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Revenue Summary
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ textAlign: 'center', pt: 2 }}>
                    <Typography variant="h3" color="success.main">
                      {formatCurrency(reportData.totalEarnings)}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                      Total Revenue (Completed Appointments)
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Summary
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1">
                    {`Date: ${selectedDate.toLocaleDateString()}`}
                  </Typography>
                  <Typography variant="body1">
                    {`Location: ${selectedClinicLocation ? clinicLocations.find(l => l.id === selectedClinicLocation)?.name : 'All Locations'}`}
                  </Typography>
                  <Typography variant="body1">
                    {`Total Appointments: ${reportData.scheduled + reportData.completed + reportData.cancelled}`}
                  </Typography>
                  <Typography variant="body1">
                    {`Completion Rate: ${reportData.completed > 0 ? 
                      Math.round((reportData.completed / (reportData.scheduled + reportData.completed + reportData.cancelled)) * 100) : 0}%`}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default TabReports;