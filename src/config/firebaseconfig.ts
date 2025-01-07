// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBMA5IXGLAI0AGogPrs5hhWlra9Jtilklk",
  authDomain: "token-launcher-telegram.firebaseapp.com",
  projectId: "token-launcher-telegram",
  storageBucket: "token-launcher-telegram.firebasestorage.app",
  messagingSenderId: "704790692162",
  appId: "1:704790692162:web:4837ec0ea53b77b5bf08db",
  measurementId: "G-X97J46THC3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {app,db}