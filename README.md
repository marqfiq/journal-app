# Helen's Journal

A modern React application built with Vite, Material UI, and Firebase.

## Tech Stack

- **Framework**: React + Vite
- **Language**: JavaScript (JSX)
- **UI Library**: Material UI (MUI)
- **Router**: react-router-dom
- **Backend**: Firebase (Auth, Firestore, Functions)

## Project Structure

```
helens-journal/
├── functions/          # Firebase Cloud Functions (initialize with firebase init functions)
├── src/
│   ├── lib/
│   │   └── firebase.js # Firebase initialization
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html          # HTML template
├── vite.config.js      # Vite configuration with proxy
└── package.json
```

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Firebase project credentials

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Firebase Setup

The Firebase configuration is in `src/lib/firebase.js`. It uses environment variables from `.env.local`:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Development Proxy

The Vite dev server is configured to proxy API requests to the Firebase Functions emulator:

- Proxy path: `/api/*`
- Target: `http://127.0.0.1:5001`

This prevents CORS errors during local development. Make sure your Firebase Functions emulator is running on port 5001.

## Firebase Functions

The `/functions` folder is ready for Firebase Cloud Functions. Initialize it with:

```bash
firebase init functions
```

