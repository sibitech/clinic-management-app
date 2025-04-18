import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import { persistAppointment, fetchClinicLocations } from '../api/userApi';
import { useAuth } from '../context/AuthContext';

const TabBook = () => {
    const [form, setForm] = useState({
        name: '',
        phone: '',
        datetime: '',
        clinicLocation: '', // Changed from 'physio'
        notes: ''
    });

    const [errors, setErrors] = useState({});
    const [submitMsg, setSubmitMsg] = useState('');
    const [clinicLocations, setClinicLocations] = useState([]);
    const [loadingLocations, setLoadingLocations] = useState(true);
    const [locationFetchError, setLocationFetchError] = useState('');
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const { user } = useAuth();

    useEffect(() => {
        const loadLocations = async () => {
            try {
                const locations = await fetchClinicLocations();
                setClinicLocations(locations);
                setLoadingLocations(false);
            } catch (error) {
                console.error("Failed to load clinic locations:", error);
                setLocationFetchError('Failed to load clinic locations.');
                setLoadingLocations(false);
                setNotification({
                    open: true,
                    message: 'Failed to load clinic locations',
                    severity: 'error'
                });
            }
        };

        loadLocations();
    }, []);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLocationChange = (event) => {
        setForm((prev) => ({ ...prev, clinicLocation: event.target.value }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = 'Required';
        if (form.name.length > 100) newErrors.name = 'Max 100 characters';
        if (form.phone && !/^[6-9]\d{9}$/.test(form.phone))
            newErrors.phone = 'Invalid Indian number';
        if (!form.datetime) newErrors.datetime = 'Required';
        if (!form.clinicLocation) newErrors.clinicLocation = 'Required'; // Changed validation
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;
        const currentUser = user?.displayName;
        const payload = {
            ...form,
            status: 'scheduled',
            updated_at: new Date().toISOString(),
            updated_by: currentUser
        };

        console.log('Submitting payload:', payload);

        try {
            const success = await persistAppointment(payload);
            setSubmitMsg(success ? 'Appointment saved successfully.' : 'Failed to save appointment.');
            setNotification({
                open: true,
                message: success ? 'Appointment saved successfully.' : 'Failed to save appointment.',
                severity: success ? 'success' : 'error'
            });
            if (success) {
                setForm({
                    name: '',
                    phone: '',
                    datetime: '',
                    clinicLocation: '',
                    notes: ''
                });
            }
        } catch (error) {
            console.error("Failed to save appointment:", error);
            setNotification({
                open: true,
                message: 'Failed to save appointment.',
                severity: 'error'
            });
        }
    };

    const handleCloseNotification = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setNotification({ ...notification, open: false });
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ maxWidth: 400 }}>
            <Stack spacing={2}>
                <Typography variant="h6">Book Appointment</Typography>

                <TextField
                    label="Patient Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                    fullWidth
                />

                <TextField
                    label="Phone Number"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    fullWidth
                />

                <TextField
                    label="Appointment Date & Time"
                    name="datetime"
                    type="datetime-local"
                    value={form.datetime}
                    onChange={handleChange}
                    error={!!errors.datetime}
                    helperText={errors.datetime}
                    required
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />

                <FormControl fullWidth required error={!!errors.clinicLocation} disabled={loadingLocations}>
                    <InputLabel id="clinic-location-label">Clinic Location</InputLabel>
                    <Select
                        labelId="clinic-location-label"
                        id="clinic-location"
                        name="clinicLocation"
                        value={form.clinicLocation}
                        label="Clinic Location"
                        onChange={handleLocationChange}
                        renderValue={(value) => {
                            const selectedLocation = clinicLocations.find(location => location.id === value);
                            return selectedLocation ? selectedLocation.name : <em>Select a location</em>;
                        }}
                    >
                        {loadingLocations ? (
                            <MenuItem value="" disabled>
                                <CircularProgress size={20} /> Loading locations...
                            </MenuItem>
                        ) : locationFetchError ? (
                            <MenuItem value="" disabled>
                                {locationFetchError}
                            </MenuItem>
                        ) : (
                            clinicLocations.map((location) => (
                                <MenuItem key={location.id} value={location.id}>
                                    {location.name}
                                </MenuItem>
                            ))
                        )}
                    </Select>
                    {errors.clinicLocation && (
                        <Typography variant="caption" color="error">{errors.clinicLocation}</Typography>
                    )}
                </FormControl>

                <TextField
                    label="Notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    fullWidth
                />

                <Button type="submit" variant="contained" color="primary">
                    Submit
                </Button>
                {submitMsg && (
                    <Typography color={submitMsg.includes('success') ? 'green' : 'red'}>
                        {submitMsg}
                    </Typography>
                )}

                <Snackbar
                    open={notification.open}
                    autoHideDuration={5000}
                    onClose={handleCloseNotification}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
                        {notification.message}
                    </Alert>
                </Snackbar>

            </Stack>
        </Box>
    );
};

export default TabBook;