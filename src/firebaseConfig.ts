import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDmjFinyBQUfZGTFmmQHnOa3e5pE5-9pI4",
    authDomain: "burger-klug.firebaseapp.com",
    projectId: "burger-klug",
    storageBucket: "burger-klug.firebasestorage.app",
    messagingSenderId: "713194979125",
    appId: "1:713194979125:web:4a709497a9d2a794b8167c",
    measurementId: "G-WNBZ2SY442"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
