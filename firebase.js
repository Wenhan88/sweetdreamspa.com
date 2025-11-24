// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyD0zppikT3B7wCAuwaIaugJenzCJIHXeYI",
  authDomain: "sweetdreammassage-6281e.firebaseapp.com",
  projectId: "sweetdreammassage-6281e",
  storageBucket: "sweetdreammassage-6281e.firebasestorage.app",
  messagingSenderId: "227955669632",
  appId: "1:227955669632:web:1d870311614bb40d66c465"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp, signInWithEmailAndPassword, signOut, onAuthStateChanged };
