// stores/userStore.js
import { defineStore } from 'pinia'
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore'
import { db } from '@/firebase'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    loading: false,
    error: null,
    unsubscribe: null  // untuk real-time listener
  }),

  actions: {
    fetchUsersRealtime(role = 'user') {
      this.loading = true
      const q = query(collection(db, 'users'), where('role', '==', role))
      this.unsubscribe = onSnapshot(
        q,
        snapshot => {
          this.users = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
          this.loading = false
        },
        err => {
          this.error = err
          this.loading = false
        }
      )
    },

    async fetchUsersOnce(role = 'user') {
    this.loading = true
    this.users   = []           // ← reset dulu
    try {
        const q    = query(collection(db, 'users'), where('role','==', role))
        const snap = await getDocs(q)
        this.users = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } finally {
        this.loading = false
    }
    },


    async deleteUser(id) {
      try {
        await deleteDoc(doc(db, 'users', id))
      } catch (err) {
        this.error = err
      }
    },

    clearListener() {
      if (typeof this.unsubscribe === 'function') {
        this.unsubscribe()
        this.unsubscribe = null
      }
    }
  }
})
