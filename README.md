# Online Complaint Management System - Setup Guide

This application is built with a modern MERN stack.

## Prerequisites
- **Node.js**: Installed on your machine.
- **MongoDB**: Installed and running locally (default: `mongodb://127.0.0.1:27017/complaint_system`).

---

## 1. Backend Setup
1. Open a terminal in the `backend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Seed dummy data:
   ```bash
   node seed.js
   ```
4. Start the server:
   ```bash
   npm start
   ```
   *The server will run on `http://localhost:5000`.*

---

## 2. Frontend Setup
1. Open a new terminal in the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The application will be available at `http://localhost:5173`.*

---

## 3. Login Credentials (if seeded)
- **User**: `john@example.com` / `password123`
- **Admin**: `admin@city.com` / `password123`

---

## Features
- **User Dashboard**: Track status of filed complaints.
- **Admin Panel**: Manage city-wide reports (Update status/Delete).
- **Responsive UI**: Works perfectly on mobile and desktop.
- **Clean Design**: Indigo-themed modern interface with smooth transitions.
