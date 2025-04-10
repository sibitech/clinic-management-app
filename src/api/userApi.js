import axios from 'axios';

// Base API client - no base URL needed for same-origin serverless functions
const api = axios.create();

// Check if a user is allowed to access the app
export async function checkUserAccess(email) {
  try {
    const response = await api.post('/api/check-access', { email });
    return response.data.isAllowed;
  } catch (error) {
    console.error("Error checking user access:", error);
    return false;
  }
}