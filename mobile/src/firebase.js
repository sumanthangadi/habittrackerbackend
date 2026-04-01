import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC5tDgF4aQs903JQrHS9lJgyYBPPk1OeGc",
  authDomain: "sumanthhabittracker.firebaseapp.com",
  projectId: "sumanthhabittracker",
  storageBucket: "sumanthhabittracker.firebasestorage.app",
  messagingSenderId: "1054749526621",
  appId: "1:1054749526621:web:210918df25ab239c089bb4",
  measurementId: "G-W0RYLEQ4J5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
