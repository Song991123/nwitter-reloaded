import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyBzCeoj4yYus7U5zXPLG9xuX8F_ysK_Umg",
  authDomain: "nwitter-reloaded-a2e10.firebaseapp.com",
  projectId: "nwitter-reloaded-a2e10",
  storageBucket: "nwitter-reloaded-a2e10.appspot.com",
  messagingSenderId: "910424738324",
  appId: "1:910424738324:web:d5300d90d028f9f1907501"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 인증 서비스
export const auth = getAuth(app);