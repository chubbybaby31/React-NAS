import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBJya5S45bGxnwkWDlWUh6zyJKIMlKzYHM",
  authDomain: "nasserver-e03d3.firebaseapp.com",
  projectId: "nasserver-e03d3",
  storageBucket: "nasserver-e03d3.appspot.com",
  messagingSenderId: "837246415089",
  appId: "1:837246415089:web:1f3bd87c8db20cef5a7950",
  measurementId: "G-ZPD3KF2F2Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider();
export {auth, provider}