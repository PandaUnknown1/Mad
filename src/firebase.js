import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
 apiKey: "AIzaSyCNeZKUZ2DXnzvU4TdS0TxFnKToRXq4xBk",
  authDomain: "madcat-1a926.firebaseapp.com",
  projectId: "madcat-1a926",
  storageBucket: "madcat-1a926.firebasestorage.app",
  messagingSenderId: "758173102678",
  appId: "1:758173102678:web:dabe3b6594ba859dde81f7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

