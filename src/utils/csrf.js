// Utility function to get CSRF token from cookie
export function getCsrfToken() {
  // Try different common cookie names
  const cookieNames = ['XSRF-TOKEN', 'XSRF_TOKEN', '_csrf'];
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  
  for (let cookieName of cookieNames) {
    const name = `${cookieName}=`;
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
  }
  
  return null;
}

// Fetch CSRF token from backend - make a request to get the cookie set
export async function fetchCsrfToken() {
  try {
    // First, try to get CSRF token by making a request to a public endpoint
    // This will set the CSRF cookie if it doesn't exist
    const response = await fetch('http://localhost:8080/user', {
      method: 'GET',
      credentials: 'include' // Important: include cookies
    });
    
    // After the request, the cookie should be set, try to get it
    let token = getCsrfToken();
    
    // If still not found, try alternative endpoint
    if (!token) {
      try {
        await fetch('http://localhost:8080/', {
          method: 'GET',
          credentials: 'include'
        });
        token = getCsrfToken();
      } catch (e) {
        console.error('Error fetching CSRF token from root:', e);
      }
    }
    
    return token;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    // Fallback to getting from cookie
    return getCsrfToken();
  }
}

