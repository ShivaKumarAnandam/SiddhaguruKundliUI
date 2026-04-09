// Configuration for API endpoints
// Determines whether to use the local development backend or the production backend
// based on the current hostname.

export const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000/api'
  : 'https://siddhagurukundli.onrender.com/api';

export default {
  API_BASE
};
