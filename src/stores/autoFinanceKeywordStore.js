import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth, db } from '@/firebase'
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  where
} from 'firebase/firestore'

export const useAutoKeywordStore = defineStore('autoFinanceKeyword', () => {
  const keywords = ref([])
  const keywordToEdit = ref(null)
  const isLoading = ref(true)
  const error = ref(null)

  const kwRef = collection(db, 'autoFinanceKeywords')

  // Fetch keywords for current user
  async function fetchKeywords() {
    isLoading.value = true
    const user = auth.currentUser
    if (!user) return

    const q = query(kwRef, where('userId', '==', user.uid))
    onSnapshot(
      q,
      snap => {
        keywords.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        isLoading.value = false
      },
      err => {
        console.error('❌ Gagal fetch keywords:', err)
        error.value = err.message
        isLoading.value = false
      }
    )
  }

  // Add new keyword entry
  async function addKeyword({ keyword, category, defaultAmount }) {
    const user = auth.currentUser
    if (!user) return
    const newKw = {
      keyword: keyword.trim().toLowerCase(),
      category,
      defaultAmount: Number(defaultAmount) || 0,
      userId: user.uid,
      createdAt: new Date().toISOString()
    }
    await addDoc(kwRef, newKw)
  }

  // Prepare keyword for edit
  function setKeywordToEdit(kw) {
    keywordToEdit.value = { ...kw }
  }

  // Update existing keyword
  async function updateKeyword(updated) {
    const { id, keyword, category, defaultAmount } = updated
    const docRef = doc(db, 'autoFinanceKeywords', id)
    const snap = await getDoc(docRef)
    if (!snap.exists()) {
      console.warn('Keyword tidak ditemukan')
      return
    }
    const data = snap.data()
    const payload = {
      ...data,
      keyword: keyword.trim().toLowerCase(),
      category,
      defaultAmount: Number(defaultAmount) || 0,
      updatedAt: new Date().toISOString()
    }
    await updateDoc(docRef, payload)
  }

  // Delete keyword entry
  async function deleteKeyword(id) {
    const docRef = doc(db, 'autoFinanceKeywords', id)
    await deleteDoc(docRef)
  }

  // Find matching keyword in a title
  function findMatch(title) {
    const lower = title.toLowerCase()
    return keywords.value.find(k => lower.includes(k.keyword)) || null
  }

  return {
    keywords,
    keywordToEdit,
    isLoading,
    error,
    fetchKeywords,
    addKeyword,
    setKeywordToEdit,
    updateKeyword,
    deleteKeyword,
    findMatch
  }
})
