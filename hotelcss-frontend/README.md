# HotelCSS Frontend

A modern React frontend application for the HotelCSS management system.

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **Tailwind CSS** - Utility-first CSS framework

## Features

- JWT-based authentication
- Role-based access control (Admin, Manager, Reception, Staff, Room)
- Protected routes based on user roles
- Automatic token injection in API requests
- Token expiration handling
- Responsive UI with Tailwind CSS

## Project Structure

```
src/
├── api/              # API configuration and endpoints
│   ├── axios.js      # Axios instance with interceptors
│   └── auth.js       # Authentication API calls
├── context/          # React Context providers
│   └── AuthContext.jsx  # Authentication context
├── pages/            # Page components
│   ├── Login.jsx
│   ├── AdminDashboard.jsx
│   ├── ReceptionDashboard.jsx
│   ├── ManagerDashboard.jsx
│   ├── StaffDashboard.jsx
│   └── RoomDashboard.jsx
├── routes/           # Routing configuration
│   ├── AppRoutes.jsx      # Main routing setup
│   └── ProtectedRoute.jsx # Protected route component
├── utils/            # Utility functions
│   └── jwt.js        # JWT token decoding utilities
├── App.jsx           # Main app component
└── main.jsx          # Entry point
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in terminal).

### Backend Configuration

Make sure your backend API is running on `https://localhost:7129`. If your backend runs on a different URL, update the `baseURL` in `src/api/axios.js`.

## Authentication Flow

1. User enters credentials on the Login page
2. Frontend calls `/api/User/Login` endpoint
3. Backend returns JWT token
4. Token is stored in localStorage
5. Token is decoded to extract user role
6. User is redirected to their role-specific dashboard

## Role-Based Routing

- **Admin** → `/admin`
- **Manager** → `/manager`
- **Reception** → `/reception`
- **Staff/Housekeeping/Restaurant** → `/staff`
- **Room** → `/room`

## API Integration

The Axios instance automatically:
- Adds `Authorization: Bearer <token>` header to all requests
- Handles 401 errors by clearing tokens and redirecting to login
- Uses the base URL configured in `src/api/axios.js`

## Building for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## Development Notes

- The JWT token is stored in localStorage
- Token expiration is checked on app initialization
- Protected routes automatically redirect unauthorized users
- All API calls include the JWT token automatically
