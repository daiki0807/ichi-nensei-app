import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCx_SZPnd7omZDmJ1OYVwEfqw3QDZpgFLQ",
    authDomain: "helpful-passage-430405-b3.firebaseapp.com",
    projectId: "helpful-passage-430405-b3",
    storageBucket: "helpful-passage-430405-b3.firebasestorage.app",
    messagingSenderId: "915619375587",
    appId: "1:915619375587:web:8c9be8217bb396885118d6"
};

const app = initializeApp(firebaseConfig);
// Initialize Firestore with the specific database ID 'okane-db'
export const db = getFirestore(app, "okane-db");
