import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDPvqp0lnIQaC-bHZG1HlTyhdFWxhnlF74",
  authDomain: "moje-domki-6c77d.firebaseapp.com",
  projectId: "moje-domki-6c77d",
  storageBucket: "moje-domki-6c77d.firebasestorage.app",
  messagingSenderId: "379384522806",
  appId: "1:379384522806:web:c1d1e59c01f995402d9097",
  measurementId: "G-BZ0SJC201Z"
};

// Zapobiega podwójnej inicjalizacji (co crashowało aplikację)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };