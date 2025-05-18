// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAMDESm0ZUGDt53g9HH2P2S_Qw9KdxFxbo",
    authDomain: "termux-commands-tools.firebaseapp.com",
    projectId: "termux-commands-tools",
    storageBucket: "termux-commands-tools.firebasestorage.app",
    messagingSenderId: "875239787709",
    appId: "1:875239787709:web:9f153e3eb922f8ef3fbbd4",
    measurementId: "G-6Q8C9QTW36"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

export { auth, storage, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, ref, uploadBytes, getDownloadURL, doc, setDoc, getDoc }; 