import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Stack
} from '@mui/material';
import { persistAppointment } from '../api/userApi';

const TabBook = () => {
    const [form, setForm] = useState({
        name: '',
        phone: '',
        datetime: '',
        physio: '',
        notes: ''
    });

    const [errors, setErrors] = useState({});

    const [submitMsg, setSubmitMsg] = useState('');

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = 'Required';
        if (form.name.length > 100) newErrors.name = 'Max 100 characters';
        if (form.phone && !/^[6-9]\d{9}$/.test(form.phone))
            newErrors.phone = 'Invalid Indian number';
        if (!form.datetime) newErrors.datetime = 'Required';
        if (!form.physio.trim()) newErrors.physio = 'Required';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        const payload = {
            ...form,
            status: 'scheduled',
            updated_at: new Date().toISOString(),
            updated_by: form.physio
        };

        console.log('Submitting payload:', payload);

        const success = await persistAppointment(payload);
        setSubmitMsg(success ? 'Appointment saved successfully.' : 'Failed to save appointment.');
        if (success) {
            setForm({
              name: '',
              phone: '',
              datetime: '',
              physio: '',
              notes: ''
            });
          }
          

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

                <TextField
                    label="Physiotherapist Name"
                    name="physio"
                    value={form.physio}
                    onChange={handleChange}
                    error={!!errors.physio}
                    helperText={errors.physio}
                    required
                    fullWidth
                />

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

            </Stack>
        </Box>
    );
};

export default TabBook;
