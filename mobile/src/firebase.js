import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC5tDgF4aQs903JQrHS9lJgyYBPPk1OeGc",
  authDomain: "sumanthhabittracker.firebaseapp.com",
  projectId: "sumanthhabittracker",
  storageBucket: "sumanthhabittracker.firebasestorage.app",
  messagingSenderId: "1054749526621",
  appId: "1:1054749526621:mobile:210918df25ab239c089bb4", // Keeping any mobile specific configs if they existed, wait, let me use the exact same config parameters originally there. Wait, I'll just keep the exact same logic.
  measurementId: "G-W0RYLEQ4J5"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});
