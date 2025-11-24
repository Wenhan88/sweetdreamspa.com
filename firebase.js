// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyD0zppikT3B7wCAuwaIaugJenzCJIHXeYI",
  authDomain: "sweetdreammassage-6281e.firebaseapp.com",
  projectId: "sweetdreammassage-6281e",
  storageBucket: "sweetdreammassage-6281e.firebasestorage.app",
  messagingSenderId: "227955669632",
  appId: "1:227955669632:web:1d870311614bb40d66c465"
};

// Initialize
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db   = firebase.firestore();
