# Techerudite Booking Application

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing bookings with email verification and different booking types.

## Features

- User authentication with email verification
- Different booking types (Full Day, Half Day, Custom)
- Booking overlap prevention
- Responsive UI with Material-UI
- Redux for state management

## Prerequisites

- Node.js (v14 or later)
- MongoDB (local or MongoDB Atlas)
- Gmail account for sending verification emails

## Setup Instructions

### 1. MongoDB Setup

- Install MongoDB locally or create a MongoDB Atlas account
- Create a new database named `techerudite-booking`

### 2. Server Setup

1. Navigate to the server directory:
```
cd techerudite-booking-app/server
```

2. Install dependencies:
```
npm install
```

3. Configure environment variables:
   - Update the `.env` file with your MongoDB connection string
   - Add your email credentials for sending verification emails

4. Start the server:
```
npm run dev
```

The server will run on http://localhost:5000

### 3. Client Setup

1. Open a new terminal and navigate to the client directory:
```
cd techerudite-booking-app/client
```

2. Install dependencies:
```
npm install
```

3. Start the client:
```
npm start
```

The client will run on http://localhost:3000

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify/:token` - Verify email
- `POST /api/auth/resend-verification` - Resend verification email
- `GET /api/auth/me` - Get current user (protected)

### Bookings

- `GET /api/bookings` - Get all bookings for current user (protected)
- `GET /api/bookings/:id` - Get a specific booking (protected)
- `POST /api/bookings` - Create a new booking (protected)
- `PUT /api/bookings/:id` - Update a booking (protected)
- `DELETE /api/bookings/:id` - Delete a booking (protected)
- `GET /api/bookings/availability` - Check availability for a date (protected)

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing
- Nodemailer for email sending

### Frontend
- React.js
- Redux for state management
- Material-UI for UI components
- Formik and Yup for form validation
- Axios for API requests

## Project Structure

```
techerudite-booking-app/
├── client/                  # React frontend
│   ├── public/              # Public assets
│   └── src/
│       ├── api/             # API service
│       ├── components/      # React components
│       ├── redux/           # Redux store, actions, reducers
│       └── App.js           # Main app component
│
└── server/                  # Node.js backend
    ├── controllers/         # Request handlers
    ├── middleware/          # Express middleware
    ├── models/              # Mongoose models
    ├── routes/              # API routes
    ├── utils/               # Utility functions
    ├── .env                 # Environment variables
    └── index.js             # Entry point
``` 