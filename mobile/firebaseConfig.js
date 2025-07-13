// mobile/firebaseConfig.js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCZumhgHiGNCtDs7TNq6E4NAGgz93lgiqc",
  authDomain: "echo-c4c6c.firebaseapp.com",
  projectId: "echo-c4c6c",
  storageBucket: "echo-c4c6c.appspot.com", // fixed value
  messagingSenderId: "1053842585049",
  appId: "1:1053842585049:web:d64d838af59ea2de6615c8",
  measurementId: "G-2MZBH709NN",
};

export const firebaseApp = initializeApp(firebaseConfig);
