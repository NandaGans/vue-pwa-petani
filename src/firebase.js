import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyAs7_GhXzVgvmafxTDmNJqc5EuGlvBaXtM",
  authDomain: "pwa-petani.firebaseapp.com",
  projectId: "pwa-petani",
  storageBucket: "pwa-petani.appspot.com",
  messagingSenderId: "49252560022",
  appId: "1:49252560022:web:9c476774c1c9e7da46a6b7",
  measurementId: "G-8YJGX2K7JE"
};

const app = initializeApp(firebaseConfig)

const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)

export { db, auth, storage }