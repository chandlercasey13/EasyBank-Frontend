// Get API base URL from environment variable
export function getApiUrl() {
  return import.meta.env.VITE_API_URL || 'http://localhost:8080';
}

// Helper function to construct full API URL
export function apiUrl(path) {
  const baseUrl = getApiUrl();
  // Remove leading slash from path if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}/${cleanPath}`;
}

// Helper function to get auth headers
export function getAuthHeaders() {
  const jwt = sessionStorage.getItem('jwt');
  return {
    'Content-Type': 'application/json',
    ...(jwt && { 'Authorization': jwt })
  };
}

// Helper function for authenticated fetch
export async function authenticatedFetch(url, options = {}) {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });

  if (response.status === 401) {
    // Unauthorized - clear auth and redirect to login
    sessionStorage.removeItem('jwt');
    sessionStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  return response;
}





