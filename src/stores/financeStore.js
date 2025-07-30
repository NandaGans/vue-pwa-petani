import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth, db } from '@/firebase'
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc
} from 'firebase/firestore'
import { nanoid } from 'nanoid'

export const useFinanceStore = defineStore('finance', () => {
  const finances = ref([])
  const financeToEdit = ref(null)
  const isLoading = ref(false)

  const collectionRef = collection(db, 'finances')

  // Fetch data keuangan milik user
  async function fetchFinances() {
    isLoading.value = true
    const user = auth.currentUser
    if (!user) {
      console.warn('🔐 Tidak bisa ambil data keuangan: user belum login')
      isLoading.value = false
      return
    }
    try {
      const q = query(collectionRef, where('userId', '==', user.uid))
      const snapshot = await getDocs(q)
      finances.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch (e) {
      console.error('❌ Gagal fetch data keuangan:', e)
    } finally {
      isLoading.value = false
    }
  }

  // Tambah atau set data keuangan
  async function addFinance(item) {
    const user = auth.currentUser
    if (!user) {
      console.warn('🔐 Gagal tambah keuangan: user belum login')
      return
    }
    const base = {
      ...item,
      id: item.id || nanoid(),
      userId: user.uid,
      createdAt: new Date().toISOString()
    }
    const docRef = doc(db, 'finances', base.id)
    try {
      await setDoc(docRef, base)
      finances.value.push(base)
    } catch (e) {
      console.error('❌ Gagal tambah keuangan:', e)
    }
  }

  // Update data keuangan
  async function updateFinance(item) {
    const docRef = doc(db, 'finances', item.id)
    const payload = {
      amount: item.amount,
      type: item.type,
      category: item.category,
      date: item.date,
      note: item.note || '',
      relatedActivityId: item.relatedActivityId || null,
      updatedAt: new Date().toISOString()
    }
    try {
      await updateDoc(docRef, payload)
      const idx = finances.value.findIndex(f => f.id === item.id)
      if (idx !== -1) {
        finances.value[idx] = { ...finances.value[idx], ...payload }
      }
    } catch (e) {
      console.warn('❌ Gagal update keuangan:', e)
    }
  }

  // Hapus data keuangan
  async function deleteFinance(id) {
    const docRef = doc(db, 'finances', id)
    try {
      await deleteDoc(docRef)
      finances.value = finances.value.filter(f => f.id !== id)
    } catch (e) {
      console.warn('❌ Gagal hapus keuangan:', e)
    }
  }

  function setFinanceToEdit(item) {
    financeToEdit.value = { ...item }
  }

  return {
    finances,
    financeToEdit,
    isLoading,
    fetchFinances,
    addFinance,
    updateFinance,
    deleteFinance,
    setFinanceToEdit
  }
})
