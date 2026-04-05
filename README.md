# DocConnect - Doctor Appointment Booking System

DocConnect is a fully dynamic, production-ready web application designed to link patients with trusted healthcare providers. It features a robust Node.js/Express backend, a MongoDB database, and a dynamic Vanilla JavaScript frontend.

## 🚀 Key Features

- **Advanced Authentication System**: Secure user registration and login for both Patients and Doctors using JWT and bcrypt password hashing.
- **Dynamic Doctor Discovery**: Real-time fetching and rendering of doctor profiles (Specialization, Experience, Fees, Availability) from the API.
- **Appointment Management**:
  - Patients can book appointments with their preferred doctors.
  - Automatic double-booking prevention to ensure time-slot integrity.
  - Role-based dashboards for viewing and managing bookings.
- **"WhatsApp Web" Style Profile System**:
  - Secure "My Profile" dropdown in the navigation bar.
  - Comprehensive `profile.html` for viewing/updating user data.
  - Doctors can manage professional details (Specialization, Fees, Availability) through their profile.
  - Secure password change functionality with old password verification.
- **Responsive & Modern UI**: Built with Vanilla CSS and HTML for a clean, professional aesthetic.

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3, Vanilla JavaScript (Fetch API).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **Security**: JSON Web Tokens (JWT), BcryptJS.
- **Environment Management**: Dotenv.

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v16.0.0 or higher)
- [MongoDB](https://www.mongodb.com/) (Local server or MongoDB Atlas URI)

## ⚙️ Installation & Setup

1. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` directory based on `.env.example`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/docconnect
   JWT_SECRET=your_super_secret_jwt_key_here
   ```

3. **Start the Backend Server**:
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

4. **Run the Frontend**:
   Simply open `index.html` in your browser. For the best experience (avoiding CORS/file:// issues), use a local server like "Live Server" in VS Code or run:
   ```bash
   npx serve .
   ```

## 🔌 API Endpoints Overview

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user & get token
- `GET /api/auth/me` - Get current logged-in user (Private)
- `PUT /api/auth/update` - Update name and email (Private)
- `PUT /api/auth/change-password` - Update password (Private)

### Doctors
- `GET /api/doctors` - Fetch all doctors (Public)
- `POST /api/doctors` - Create doctor profile (Doctor only)
- `PUT /api/doctors/profile` - Update doctor profile (Doctor only)

### Appointments
- `POST /api/appointments` - Book a new appointment (Private)
- `GET /api/appointments/my` - Fetch user's appointments (Private)
- `PUT /api/appointments/:id` - Cancel or complete appointment (Private)

## 👤 Sample Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Doctor** | `swagat-swagat@gmail.com` | `123456` |
| **Patient** | `gcc-abc@gmail.com` | `123456` |

---
&copy; 2026 DocConnect. All Rights Reserved.
