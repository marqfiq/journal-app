# Setup Guide

## Prerequisites

Before running the app locally, you need to:

1. **Install dependencies** (already done if you see `node_modules` folder):
   ```bash
   npm install
   ```

2. **Set up Firebase credentials** (required for the app to work)

## Firebase Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### Step 2: Get Your Firebase Config

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon `</>` to add a web app (if you haven't already)
5. Register your app with a nickname (e.g., "Helen's Journal")
6. Copy the `firebaseConfig` object values

### Step 3: Create Environment File

1. **Copy the example file**:
   ```bash
   # On Windows (PowerShell):
   Copy-Item .env.local.example .env.local
   
   # On Mac/Linux:
   cp .env.local.example .env.local
   ```

2. **Open `.env.local`** and fill in your Firebase credentials:
   ```
   VITE_FIREBASE_API_KEY=your-actual-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-actual-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-actual-app-id
   ```

   **Important**: Replace all the placeholder values with your actual Firebase config values!

### Step 4: Enable Firebase Services

You need to enable these Firebase services in your Firebase Console:

1. **Authentication**:
   - Go to "Authentication" → "Get started"
   - Enable at least one sign-in method (e.g., Email/Password, Google)

2. **Firestore Database**:
   - Go to "Firestore Database" → "Create database"
   - Start in **test mode** for development (you'll set up security rules later)
   - Choose a location for your database

3. **Storage**:
   - Go to "Storage" → "Get started"
   - Start in **test mode** for development
   - Use the same location as Firestore

### Step 5: Set Up Firestore Security Rules (Important!)

In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /entries/{entryId} {
      // Only allow users to read/write their own entries
      allow read, write: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

### Step 6: Set Up Storage Security Rules

In Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /journal-images/{userId}/{allPaths=**} {
      // Only allow users to upload/read their own images
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /journal-images/{allPaths=**} {
      // Fallback for files without userId folder (shouldn't happen, but safe)
      allow read, write: if request.auth != null;
    }
  }
}
```

## Running the App

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open your browser** to the URL shown (usually `http://localhost:5173`)

3. **Sign in**:
   - The app will redirect you to `/login` if not authenticated
   - You'll need to implement login functionality (currently just a placeholder)

## Testing Checklist

- [ ] Firebase credentials configured in `.env.local`
- [ ] Authentication enabled in Firebase Console
- [ ] Firestore Database created
- [ ] Storage enabled
- [ ] Security rules configured
- [ ] App runs without errors (`npm run dev`)
- [ ] Can access Home page (will redirect to login if not authenticated)

## Troubleshooting

### App shows Firebase errors
- ✅ Check that `.env.local` exists and has all required variables
- ✅ Verify all Firebase config values are correct (no extra quotes, no spaces)
- ✅ Make sure `.env.local` is in the root directory (same level as `package.json`)

### "Permission denied" errors
- ✅ Check Firestore Security Rules are set up correctly
- ✅ Make sure you're authenticated
- ✅ Verify Storage Rules are configured

### Can't see environment variables
- ✅ Restart the dev server after creating/modifying `.env.local`
- ✅ Make sure variable names start with `VITE_` (they do)
- ✅ Check that `.env.local` is not in `.gitignore` (it should be, but make sure it exists locally)

### Authentication issues
- ✅ Enable Authentication in Firebase Console
- ✅ Set up at least one sign-in method
- ✅ Make sure you're testing with a valid user account

## Next Steps

Once everything is set up:
1. Implement the login page (currently just a placeholder)
2. Start creating journal entries
3. Test the "On This Day" feature (will only show entries after you have data from previous years)

