/**
 * Decode JWT token without verification (client-side only)
 * @param {string} token - JWT token string
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Extract role from JWT token
 * @param {string} token - JWT token string
 * @returns {string|null} User role or null if not found
 */
export const getRoleFromToken = (token) => {
  const decoded = decodeToken(token);
  if (!decoded) return null;
  
  // ASP.NET Core uses 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role' for role claim
  // But it's often simplified to 'role' in the decoded token
  return decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
         decoded.role || 
         decoded.Role || 
         null;
};

/**
 * Extract user ID from JWT token
 * @param {string} token - JWT token string
 * @returns {string|null} User ID or null if not found
 */
export const getUserIdFromToken = (token) => {
  const decoded = decodeToken(token);
  if (!decoded) return null;
  
  return decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
         decoded.nameid ||
         decoded.sub ||
         null;
};

/**
 * Extract username from JWT token
 * @param {string} token - JWT token string
 * @returns {string|null} Username or null if not found
 */
export const getUsernameFromToken = (token) => {
  const decoded = decodeToken(token);
  if (!decoded) return null;
  
  return decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
         decoded.name ||
         decoded.unique_name ||
         null;
};

/**
 * Check if token is expired
 * @param {string} token - JWT token string
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};
