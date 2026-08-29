# MITTSU WRITERS — Firebase Google + Email Login Setup

This version preserves the original website files and replaces the old browser-only login with Firebase Authentication.

## 1. Create Firebase project

1. Open Firebase Console: https://console.firebase.google.com/
2. Create a Firebase project.
3. Add a Web App.
4. Copy its Firebase configuration into `firebase-config.js`.

## 2. Enable authentication

Firebase Console → Authentication → Sign-in method:

- Enable **Email/Password**.
- Enable **Google**.

For Google sign-in, configure the project's authorized domains as needed for your hosting provider.

## 3. Create the admin account

In Firebase Console → Authentication → Users → Add user, create:

Email: `trilogypublishers2022@gmail.com`

Set the initial password to the password you want to use (do not hard-code it into the website).

The website identifies this exact authenticated email as the only admin.

## 4. Password reset

The Login window has **Forgot password?**. Firebase sends the reset email to the address entered. This works for the admin and readers who use Email/Password authentication.

Google accounts do not use a separate website password; Google handles their authentication.

## 5. Firestore rules

Deploy `firestore.rules` if you later migrate the story database from localStorage to Firestore. The rules allow only the exact admin email to write story/chapter documents.

## 6. Important current architecture note

The original site's story/reader database is intentionally preserved in `script.js` and remains localStorage-backed in this upgrade so that no existing stories or features are removed. Firebase is used for authentication and identity.

If you want stories, chapters, likes, votes and comments to synchronize between every visitor's device, the next migration should move the DB layer itself to Firestore. Do that only after testing the authentication flow, because it requires converting the current synchronous DB calls to asynchronous Firestore operations.
