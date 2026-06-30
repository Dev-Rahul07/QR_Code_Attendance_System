# Complete QR-Based Attendance Management System

This is a production-quality local development setup for a QR Code Based Attendance Management System.

## Architecture

The project is structured into two main components:
- **Backend:** Django 5, Django REST Framework, PostgreSQL, Redis, Celery, and Channels.
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Shadcn UI.
- **Infrastructure:** Docker Compose is used to orchestrate the entire stack.

## Prerequisites

- Docker and Docker Compose installed on your machine.
- Ports 8000 (Backend), 5173 (Frontend), 5432 (PostgreSQL), and 6379 (Redis) must be available.

## How to Run

1. Simply run the following command in the root of the project:
   ```bash
   docker compose up --build
   ```
2. The backend migrations will run automatically.
3. To seed initial data (Admin, Teacher, Student), open a new terminal and run:
   ```bash
   docker compose exec backend python seed.py
   ```
   **Demo Users:**
   - Admin: `admin` / `admin123`
   - Teacher: `teacher1` / `teacher123`
   - Student: `student1` / `student123`

## Accessing the Application

- **Frontend Application:** http://localhost:5173
- **Backend Admin:** http://localhost:8000/admin/
- **API Swagger Documentation:** http://localhost:8000/api/docs/

## Features Implemented

### Backend Core
- **JWT Authentication:** Secure role-based access control (Admin, Teacher, Student).
- **Domain Models:** Departments, ClassRooms, Sections, Student Profiles, Teacher Profiles.
- **QR Code Engine:** Secure, signed, expiring QR generation using `pyzbar` and `qrcode`.
- **Attendance Logic:** Handles check-in and check-out tracking, working hours, and duplicate prevention.
- **Leave & Holiday Management:** Workflows for students applying for leave and teachers approving them.
- **Real-Time Notifications:** WebSocket integration using Django Channels.
- **Reports & Analytics:** API endpoints for CSV/Excel exports and dashboard statistics.

### Frontend Architecture
- **Vite + React 19:** Fast development server.
- **Routing:** React Router with Protected Routes based on User Roles.
- **State Management:** Context API for Auth, TanStack Query ready for API calls.
- **Styling:** Tailwind CSS + Shadcn UI base.
- **Login Flow:** Functional JWT login with automatic redirect to role-based dashboards.

## Next Steps for Frontend UI
The backend is fully complete. The frontend has a robust architecture and authentication flow. To complete the UI layer:
1. Implement the generic `QR Scanner` component using the browser `MediaDevices` API and send the decoded string to `POST /api/attendance/scan-qr/`.
2. Expand the `AdminDashboard`, `TeacherDashboard`, and `StudentDashboard` placeholder pages with Recharts and data tables hitting the respective backend endpoints.
