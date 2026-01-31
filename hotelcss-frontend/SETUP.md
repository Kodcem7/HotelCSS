# HotelCSS Frontend - Setup Guide

## Quick Start

1. **Navigate to the frontend directory:**
   ```bash
   cd hotelcss-frontend
   ```

2. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - The app will be available at `http://localhost:5173` (or the port shown in terminal)

## Backend Configuration

### Important: CORS Setup

Make sure your ASP.NET Core backend has CORS configured to allow requests from the frontend. Add this to your `Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// In the app configuration section:
app.UseCors("AllowReactApp");
```

### API Base URL

The frontend is configured to connect to `https://localhost:7129/api` by default. If your backend runs on a different URL:

1. Update `src/api/axios.js` and change the `baseURL`:
   ```javascript
   const api = axios.create({
     baseURL: 'YOUR_BACKEND_URL/api',
     // ...
   });
   ```

   OR use environment variables:
   - Create a `.env` file in the frontend root
   - Add: `VITE_API_BASE_URL=https://localhost:7129/api`
   - Update `axios.js` to use `import.meta.env.VITE_API_BASE_URL`

## Authentication Flow

1. **Login Process:**
   - User enters username and password
   - Frontend calls `POST /api/User/Login` with `{ UserName, Password }`
   - Backend returns `{ success: true, token: "..." }`
   - Token is stored in `localStorage`
   - Token is decoded to extract user role
   - User is redirected to role-specific dashboard

2. **Token Storage:**
   - JWT token stored in `localStorage` as `token`
   - User data stored in `localStorage` as `user` (JSON string)

3. **Automatic Token Injection:**
   - All API requests automatically include `Authorization: Bearer <token>` header
   - Handled by Axios request interceptor in `src/api/axios.js`

4. **Token Expiration:**
   - Token expiration is checked on app initialization
   - Expired tokens are automatically cleared
   - User is redirected to login if token is expired

## Role-Based Routing

| Role | Route | Dashboard Component |
|------|-------|---------------------|
| Admin | `/admin` | AdminDashboard |
| Manager | `/manager` | ManagerDashboard |
| Reception | `/reception` | ReceptionDashboard |
| Staff/Housekeeping/Restaurant | `/staff` | StaffDashboard |
| Room | `/room` | RoomDashboard |

## Project Structure Explained

### `/src/api`
- **axios.js**: Axios instance with interceptors for automatic token injection
- **auth.js**: Authentication-related API calls (login, logout)

### `/src/context`
- **AuthContext.jsx**: Global authentication state management
  - Provides `user`, `token`, `login()`, `logout()`, `isAuthenticated`
  - Handles token decoding and role extraction
  - Persists authentication state across page refreshes

### `/src/routes`
- **AppRoutes.jsx**: Main routing configuration
  - Defines all routes (public and protected)
  - Handles role-based redirects
- **ProtectedRoute.jsx**: Route protection component
  - Checks authentication status
  - Validates user role against route requirements
  - Redirects unauthorized users

### `/src/pages`
- **Login.jsx**: Login page with form validation
- **AdminDashboard.jsx**: Admin dashboard (placeholder)
- **ReceptionDashboard.jsx**: Reception dashboard (placeholder)
- **ManagerDashboard.jsx**: Manager dashboard (placeholder)
- **StaffDashboard.jsx**: Staff dashboard (placeholder)
- **RoomDashboard.jsx**: Room dashboard (placeholder)

### `/src/utils`
- **jwt.js**: JWT token utilities
  - `decodeToken()`: Decodes JWT without verification
  - `getRoleFromToken()`: Extracts role from token
  - `getUserIdFromToken()`: Extracts user ID
  - `getUsernameFromToken()`: Extracts username
  - `isTokenExpired()`: Checks token expiration

## Testing the Setup

1. **Start your backend API** (should be running on `https://localhost:7129`)

2. **Start the frontend:**
   ```bash
   npm run dev
   ```

3. **Test Login:**
   - Navigate to `http://localhost:5173`
   - You should be redirected to `/login`
   - Enter valid credentials
   - You should be redirected to your role-specific dashboard

4. **Test Protected Routes:**
   - Try accessing `/admin` without logging in → should redirect to `/login`
   - Login as Admin → should access `/admin` successfully
   - Login as Reception → accessing `/admin` should redirect to `/reception`

## Troubleshooting

### CORS Errors
- Make sure CORS is configured in your backend
- Check that the frontend URL is in the allowed origins list

### 401 Unauthorized Errors
- Check that the token is being stored correctly (check browser DevTools → Application → Local Storage)
- Verify the token format in the backend response
- Check that the JWT claim names match (role claim should be accessible)

### Token Not Being Sent
- Check browser DevTools → Network tab
- Verify the `Authorization` header is present in requests
- Check that token exists in localStorage

### Role Extraction Issues
- Open browser DevTools → Console
- Check for JWT decoding errors
- You can manually decode the token at jwt.io to verify claim names
- Update `src/utils/jwt.js` if claim names differ

## Next Steps

1. **Customize Dashboards:**
   - Add actual functionality to each dashboard
   - Integrate with other API endpoints
   - Add data fetching and display

2. **Add More Features:**
   - User profile page
   - Settings page
   - Notifications
   - Error boundaries
   - Loading states

3. **Enhance UI:**
   - Add more Tailwind components
   - Create reusable components
   - Add animations and transitions
   - Improve responsive design

## Development Tips

- Use React DevTools to inspect component state
- Check Network tab in DevTools to monitor API calls
- Use Console to debug JWT token decoding
- Tailwind CSS IntelliSense extension recommended for VS Code
