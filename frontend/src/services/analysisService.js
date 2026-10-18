import apiClient from './api';

/**
 * Submits resumes and job description for screening analysis.
 * @param {FormData} formData - Multipart form data containing files and weights
 * @returns {Promise<object>} Analysis results payload
 */
export async function analyzeResumes(formData) {
  const response = await apiClient.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * Requests AI-generated recruiting email content.
 * @param {object} payload - { candidate_name, job_title, missing_skills, resume_summary }
 * @returns {Promise<object>} { subject, body }
 */
export async function generateRecruitingEmail(payload) {
  const response = await apiClient.post('/generate_email', payload);
  return response.data;
}

/**
 * Dispatches an email via backend Resend API.
 * @param {object} payload - { to_email, subject, email_content }
 * @returns {Promise<object>} Dispatch response
 */
export async function sendEmail(payload) {
  const response = await apiClient.post('/send-email', payload);
  return response.data;
}
