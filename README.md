# ThesisBoard
ThesisBoard: A Node.js and React Web-Based Platform for Managing Pre-Thesis and Thesis Projects

## 📋 Table of Contents
- [Introduction](#introduction)
- [Tech Stack](#tech-stack)
- [System Requirements](#system-requirements)
- [Installation Guide](#installation-guide)
  - [1. Auth0 Setup](#1-auth0-setup)
  - [2. Database Setup](#2-database-setup)
  - [3. Backend Configuration](#3-backend-configuration)
  - [4. Frontend Configuration](#4-frontend-configuration)
  - [5. Running the Application](#5-running-the-application)
- [Project Structure](#project-structure)
- [Security](#security)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## 🎯 Introduction
ThesisBoard is a management platform for pre-thesis and thesis projects, helping students and supervisors manage, track progress, and collaborate effectively.

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Relational database
- **Auth0** - Authentication & Authorization

### Frontend
- **React** - UI library
- **Auth0 React SDK** - Authentication integration

## 💻 System Requirements

- Node.js >= 14.x
- npm >= 6.x
- MySQL >= 8.0
- Git

## 📦 Installation Guide

### 1. Auth0 Setup

#### 1.1. Create Auth0 Account
1. Visit [auth0.com](https://auth0.com) and sign up for a free account
2. Create a new tenant: [customize-domain].us.auth0.com (e.g., `thesisboard.us.auth0.com` - custom it if duplicated)

#### 1.2. Create API for Backend
1. Go to **Applications** → **APIs** → **Create API**
2. Fill in the information:
   - **Name**: `ThesisBoard API`
   - **Identifier**: `https://[customize-domain]-api.com` (custom URL, doesn't need to be real)
   - **Signing Algorithm**: `RS256`
3. Click **Create**
4. Save the **Identifier** - this is the value for `AUTH0_AUDIENCE`

#### 1.3. Create Machine-to-Machine Application
1. Go to **Applications** → **Applications** → **Create Application**
2. Enter name: `ThesisBoard Backend M2M`
3. Select type: **Machine to Machine Applications**
4. Click **Create**
5. Select authorize with **Auth0 Management API**
6. Grant the following permissions:
   ```
   - admin:all
   - moderator:all
   - teacher:all
   - student:all
   ```
7. Click **Authorize**
8. Go to **Settings** tab and save:
   - **Domain** → `AUTH0_DOMAIN`
   - **Client ID** → `AUTH0_M2M_CLIENT_ID`
   - **Client Secret** → `AUTH0_M2M_CLIENT_SECRET`

#### 1.4. Create Single Page Application for Frontend
1. Go to **Applications** → **Applications** → **Create Application**
2. Enter name: `ThesisBoard Frontend`
3. Select type: **Single Page Web Applications**
4. Click **Create**
5. Go to **Settings** tab and configure:
   - **Allowed Callback URLs**: `http://localhost:3000/callback`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`
   - **Allowed Origins (CORS)**: `http://localhost:3000`
6. Click **Save Changes**
7. Save:
   - **Domain** → For Frontend config
   - **Client ID** → For Frontend config

### 2. Database Setup

#### 2.1. Start MySQL
Ensure MySQL Server is running on your machine.

#### 2.2. Create Database
Open MySQL command line or MySQL Workbench:

```sql
CREATE DATABASE thesisboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 2.3. Create User (Optional)
If you want to use a separate user instead of root:

```sql
CREATE USER 'thesisboard_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON thesisboard.* TO 'thesisboard_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Backend Configuration

#### 3.1. Clone Repository
```bash
git clone git@github.com:thientr18/ThesisBoard.git
pwd
cd <pwd>
```

#### 3.2. Install Dependencies
```bash
cd backend
npm install
```

#### 3.3. Create .env File
Create a `.env` file in the `backend/` directory:

```bash
# filepath: backend/.env
# MySQL Configuration
MYSQL_PORT=3306
MYSQL_HOST=localhost
MYSQL_DATABASE_NAME=thesisboard
MYSQL_USERNAME=root
MYSQL_PASSWORD=your_mysql_password

# Server Port
PORT=8080

# Auth0 Configuration
AUTH0_AUDIENCE=https://[customize-domain]-api.com
AUTH0_DOMAIN=[customize-domain].us.auth0.com
AUTH0_ISSUER_BASE_URL=https://[customize-domain].us.auth0.com
AUTH0_MANAGEMENT_API=https://[customize-domain].us.auth0.com/api/v2/

# Auth0 M2M Credentials (from step 1.3)
AUTH0_M2M_CLIENT_ID=your_m2m_client_id
AUTH0_M2M_CLIENT_SECRET=your_m2m_client_secret
```

**⚠️ Important**: 
- Replace `your_*` values with actual credentials
- Do NOT commit `.env` file to Git

#### 3.4. Run Migrations (if applicable)
```bash
npm run migrate
# or
npm run db:setup
```

### 4. Frontend Configuration

#### 4.1. Install Dependencies
```bash
cd frontend
npm install
```

#### 4.2. Create .env.local File
Create a `.env.local` file in the `frontend/` directory:

```bash
# filepath: frontend/.env.local
# Auth0 Configuration (from step 1.4)
REACT_APP_AUTH0_DOMAIN=[customize-domain].us.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your_spa_client_id
REACT_APP_AUTH0_AUDIENCE=https://[customize-domain]-api.com

# API Configuration
REACT_APP_API_URL=http://localhost:8080
```

**⚠️ Important**: Replace `your_spa_client_id` with Client ID from step 1.4

### 5. Running the Application

#### 5.1. Start Backend
Open a new terminal:
```bash
cd backend
npm run dev
# or
npm start
```

Backend will run at: `http://localhost:8080`

#### 5.2. Start Frontend
Open a new terminal:
```bash
cd frontend
npm start
```

Frontend will run at: `http://localhost:3000`

#### 5.3. Verify
1. Visit `http://localhost:3000`
2. Click **Login** or **Sign Up** button
3. Authenticate with Auth0
4. Test basic functionality

## 📁 Project Structure

```
ThesisBoard/
├── backend/
│   ├── src/
│   │   ├── config/       # Database, auth configuration
│   │   ├── controllers/  # API controllers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── middlewares/  # Auth & validation middlewares
│   │   └── utils/        # Helper functions
│   ├── .env             # Environment variables (not in git)
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── hooks/       # Custom hooks
│   │   └── utils/       # Helper functions
│   ├── .env.local       # Environment variables (not in git)
│   └── package.json
└── README.md
```

## 🔒 Security

### Important:
1. **Never commit** `.env` and `.env.local` files to Git
2. Add to `.gitignore`:
   ```
   # Environment variables
   .env
   .env.local
   .env.*.local
   ```
3. Use **different environment variables** for development and production
4. Regularly **rotate** Auth0 Client Secrets
5. Use **HTTPS** in production

## 🚀 Production Deployment

### Backend
1. Update Callback URLs in Auth0 with production domain
2. Update environment variables on hosting platform
3. Ensure MySQL database has regular backups

### Frontend
1. Build for production:
   ```bash
   npm run build
   ```
2. Deploy `build/` directory to hosting (Vercel, Netlify, etc.)
3. Update Auth0 URLs with production domain

## 🐛 Troubleshooting

### Database Connection Error
- Check if MySQL server is running
- Verify credentials in `.env`
- Check firewall settings

### Auth0 Errors
- Verify Client ID and Client Secret
- Check Callback URLs are configured correctly
- Verify API permissions

### CORS Errors
- Check `Allowed Origins` in Auth0 Application settings
- Verify backend CORS configuration
