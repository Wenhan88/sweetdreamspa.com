// =========================================
// Sweet Dream Massage - Firebase Frontend
// Final Production Version (Do Not Modify)
// =========================================

// 🟢 1. Firebase Project Config
// 这是你自己的 Firebase 项目配置（公开部分，不影响安全性）
const firebaseConfig = {
    apiKey: "AIzaSyD0zppikT3B7wCAuwaIaugJenzCJIHXeYI",
    authDomain: "sweetdreammassage-6281e.firebaseapp.com",
    projectId: "sweetdreammassage-6281e",
    storageBucket: "sweetdreammassage-6281e.firebasestorage.app",
    messagingSenderId: "227955669632",
    appId: "1:227955669632:web:1d870311614bb40d66c465"
};

// 🟢 2. Initialize Firebase (compat SDK)
firebase.initializeApp(firebaseConfig);

// 🟢 3. Export Firestore & Auth (全站都使用这个)
const db = firebase.firestore();
const auth = firebase.auth();

// 🟢 4. Firestore 安全设置：忽略 undefined 字段（更稳定）
db.settings({ ignoreUndefinedProperties: true });

// 现在所有页面都能使用：
// db   => Firestore 数据库
// auth => Firebase 登录账号（admin 使用）
//
// 页面里无需再次初始化 Firebase，直接用即可：
// db.collection("reviews").add({ ... })
// auth.signInWithEmailAndPassword(email, password)
// =========================================
