import axios from 'axios';

// Base API client - no base URL needed for same-origin serverless functions
const api = axios.create();
const API_BASE_URL = '/api';

// Check if a user is allowed to access the app
export async function checkUserAccess(email) {
  try {
    const response = await api.post(`${API_BASE_URL}/check-access`, { email });
    return response.data.isAllowed;
  } catch (error) {
    console.error("Error checking user access:", error);
    return false;
  }
}

export async function persistAppointment(payload) {
  try {
    const response = await api.post(`${API_BASE_URL}/persist-appointment`, { payload });
    return response.data.success; // assuming backend returns { success: true }
  } catch (error) {
    console.error("Error persisting appointment:", error);
    return false;
  }
}
// Format date to YYYY-MM-DD format in UTC for API requests
const formatDateForAPI = (date) => {
  // Ensure the date is treated as UTC midnight
  const utcDate = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ));
  return utcDate.toISOString().split('T')[0];
};

/**
 * Fetch clinic locations
 * 
 * @returns {Array} Array of clinic locations
 */
export const fetchClinicLocations = async () => {
  try {   
    const response = await axios.get(`${API_BASE_URL}/get-clinic-locations`);
    
    if (response.data.success) {
      return response.data.data || [];
    } else {
      console.error('API returned error:', response.data.error);
      return [];
    }
  } catch (error) {
    console.error('Error fetching clinic locations:', error);
    throw error;
  }
};

/**
 * Fetch appointments for a specific date
 * @param {Date} date - Date object
 * @returns {Array} Array of appointments
 */
export const fetchAppointmentsByDateAndByLocation = async (date, location) => {
  try {
    const formattedDate = formatDateForAPI(date);
    const response = await axios.get(`${API_BASE_URL}/get-appointments`, {
      params: { date: formattedDate,  location: location}
    });
    
    if (response.data.success) {
      return response.data.data || [];
    } else {
      console.error('API returned error:', response.data.error);
      return [];
    }
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

/**
 * Update an appointment
 * @param {Object} appointmentData - The appointment data to update
 * @returns {Object} Result of the operation
 */
export const updateAppointment = async (appointmentData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/update-appointment`, {
      payload: appointmentData
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};

/**
 * Delete an appointment
 * @param {string} appointmentId - The appointment ID to delete
 * @returns {Object} Result of the operation
 */
export const deleteAppointment = async (appointmentId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/delete-appointment`, {
      params: { id: appointmentId }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
};