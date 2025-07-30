import { defineStore } from 'pinia'
import { auth } from '@/firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import { setDoc, doc, getDoc } from 'firebase/firestore' // ← tambahkan getDoc di sini
import { db } from '@/firebase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    role: null,        // ← tambahkan ini agar bisa menyimpan role
    loading: false,
    error: null
  }),

  actions: {
    async login(email, password) {
      this.loading = true
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        this.user = userCredential.user
        this.error = null

        await this.fetchUserRole(this.user.uid) // ← perbaikan di sini
      } catch (err) {
        this.error = err.message
        this.user = null
      } finally {
        this.loading = false
      }
      
    },
    

    async register(email, password, username) {
      this.loading = true
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          username: username,
          role: 'user'
        })

        this.user = user
        this.error = null
        await this.fetchUserRole(user.uid) // optional: fetch langsung
      } catch (err) {
        this.error = err.message
        this.user = null
      } finally {
        this.loading = false
      }
    },

    async fetchUserRole(uid) {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid))
        if (userDoc.exists()) {
          this.role = userDoc.data().role
        } else {
          this.role = null
        }
      } catch (err) {
        this.error = err.message
      }
    },

    async logout() {
      await signOut(auth)
      this.user = null
      this.role = null
    },

    setUser(user) {
      this.user = user
    }
  },
  persist: true
  
})
