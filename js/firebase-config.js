// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC5wHhdIZlY9txtYkN88R-67lIP5FZlFpY",
    authDomain: "mtag-1c04d.firebaseapp.com",
    projectId: "mtag-1c04d",
    storageBucket: "mtag-1c04d.firebasestorage.app",
    messagingSenderId: "487741931549",
    appId: "1:487741931549:web:cf45afe3c7b5cda7de06f4"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 👇 ADICIONE ESTA LINHA
export { auth };
