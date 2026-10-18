import apiClient from './api';

/**
 * Fetches user scoring weights and signature settings from backend.
 * @param {string} token - Supabase JWT access token
 * @returns {Promise<object>} User settings object
 */
export async function fetchUserSettings(token) {
  const response = await apiClient.get('/settings', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

/**
 * Upserts user scoring weights and signature settings to backend / Supabase.
 * @param {string} token - Supabase JWT access token
 * @param {object} payload - Settings payload
 * @returns {Promise<object>} Response data
 */
export async function saveUserSettings(token, payload) {
  const response = await apiClient.post('/settings', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
