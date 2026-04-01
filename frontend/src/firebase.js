import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC5tDgF4aQs903JQrHS9lJgyYBPPk1OeGc",
  authDomain: "sumanthhabittracker.firebaseapp.com",
  projectId: "sumanthhabittracker",
  storageBucket: "sumanthhabittracker.firebasestorage.app",
  messagingSenderId: "1054749526621",
  appId: "1:1054749526621:web:210918df25ab239c089bb4",
  measurementId: "G-W0RYLEQ4J5"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});
