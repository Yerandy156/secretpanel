import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBvw10ctiRBUb_pG2g9tg4lrK8hM72M74Q",
  authDomain: "securenexus-panel.firebaseapp.com",
  projectId: "securenexus-panel",
  storageBucket: "securenexus-panel.appspot.com",
  messagingSenderId: "724981941661",
  appId: "1:724981941661:web:8f93b2e98f9cd3f46a9832"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
