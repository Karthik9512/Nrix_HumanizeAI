import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyCOSHji-niizJiR1KEF4JxjfN1JGEhoB-4",
  authDomain: "nrix-humanizeai.firebaseapp.com",
  projectId: "nrix-humanizeai-3aecd",
  storageBucket: "nrix-humanizeai.firebasestorage.app",
  messagingSenderId: "902455492193",
  appId: "1:902455492193:web:4b1795a24c6052bd7e7420",
  measurementId: "G-70T0174EEB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
