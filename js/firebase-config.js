// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyA1L565-G0qLv7egXWrzl4EKTXPOQJg2c8",
    authDomain: "sempdec.firebaseapp.com",
    projectId: "sempdec",
    storageBucket: "sempdec.firebasestorage.app",
    messagingSenderId: "113645898789",
    appId: "1:113645898789:web:7ae810650c8a9b19d703cc"
  };

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 👇 ADICIONE ESTA LINHA
export { auth };
