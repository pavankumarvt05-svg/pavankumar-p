# Lumina Library Management System

## Setup Instructions

1. **Environment Variables**:
   Ensure `GEMINI_API_KEY` is set in your environment (handled by AI Studio).
   The app uses SQLite, so no external database setup is required.

2. **Installation**:
   The system automatically installs dependencies. If needed, run:
   ```bash
   npm install
   ```

3. **Running the App**:
   The app runs in full-stack mode. The server handles both API and frontend serving.
   ```bash
   npm run dev
   ```

4. **Admin Credentials**:
   - **Username**: admin
   - **Password**: admin123
   (These are initialized in the database on first run)

## Features
- **Dashboard**: Real-time summary of library stats.
- **Books**: Full CRUD for book inventory.
- **Students**: Register and manage student records.
- **Issuing**: Issue books with automated quantity tracking.
- **Returns**: Return books with automated fine calculation (₹2/day after 7 days).
