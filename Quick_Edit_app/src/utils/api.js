const API_BASE = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include', // sends session cookie
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Request failed: ${response.status}`);
  }
  return response.json();
}

export const sessionApi = {
  create: (tool = 'editor') => request('/sessions', { method: 'POST', body: JSON.stringify({ tool }) }),
  get: () => request('/sessions', { method: 'GET' }),
  update: (data) => request('/sessions', { method: 'PUT', body: JSON.stringify(data) }),
  delete: () => request('/sessions', { method: 'DELETE' }),
};