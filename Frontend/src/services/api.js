import axios from 'axios';
import { API_BASE_URL } from '../config/api';

/**
 * Shared Axios instance configured with base API URL.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

export default apiClient;
