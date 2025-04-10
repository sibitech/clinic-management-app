import axios from 'axios';

// Base URL is not needed for same-origin serverless functions
const api = axios.create();

// Check if user is allowed
export async function checkUserAccess(email) {
  try {
    const response = await api.post('/api/check-access', { email });
    return response.data.isAllowed;
  } catch (error) {
    console.error("Error checking user access:", error);
    return false;
  }
}

// Admin functions - these would need proper auth in production
export async function addAllowedUser(email, name, notes, apiKey) {
  try {
    const response = await api.post(
      '/api/users/allow', 
      { email, name, notes },
      { headers: { 'x-api-key': apiKey } }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
}

export async function getAllowedUsers(apiKey) {
  try {
    const response = await api.get(
      '/api/users',
      { headers: { 'x-api-key': apiKey } }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting users:", error);
    throw error;
  }
}