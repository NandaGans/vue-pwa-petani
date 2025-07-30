import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth, db } from '@/firebase'
import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore'

export const useAssetStore = defineStore('asset', () => {
  const assets = ref([])
  const assetToEdit = ref(null)
  const isLoading = ref(true)
  const error = ref(null)

  const assetRef = collection(db, 'assets')

  // Fetch assets for current user
  async function fetchAssets() {
    isLoading.value = true
    const user = auth.currentUser
    if (!user) {
      isLoading.value = false
      return
    }
    const q = query(assetRef, where('userId', '==', user.uid))
    onSnapshot(
      q,
      snap => {
        assets.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        isLoading.value = false
      },
      err => {
        error.value = err.message
        isLoading.value = false
      }
    )
  }

  // Add new asset
  /**
   * @param {{ name: string; type: 'tool' | 'consumable'; quantity?: number; defaultPurchasePrice?: number; defaultRentalPrice?: number }} options
   */
  async function addAsset({ name, type = 'tool', quantity = 0, defaultPurchasePrice = 0, defaultRentalPrice = 0 }) {
    const user = auth.currentUser
    if (!user) return
    const newAsset = {
      name,
      type,                       // 'tool' | 'consumable'
      quantity,
      status: 'tersedia',         // tersedia | akan digunakan | in-use | butuh servis
      usageHistory: [],
      defaultPurchasePrice,
      defaultRentalPrice,
      lastServicedAt: null,
      userId: user.uid,
      createdAt: new Date().toISOString()
    }
    await addDoc(assetRef, newAsset)
  }

  // Prepare asset for editing
  function setAssetToEdit(asset) {
    assetToEdit.value = { ...asset }
  }

  // Update asset fields
  /**
   * @param {{ id: string; name?: string; type?: 'tool' | 'consumable'; quantity?: number; status?: string; defaultPurchasePrice?: number; defaultRentalPrice?: number; lastServicedAt?: string }} updated
   */
  async function updateAsset(updated) {
    const docRef = doc(db, 'assets', updated.id)
    const snap = await getDoc(docRef)
    if (!snap.exists()) return
    const data = snap.data()
    const payload = {
      ...data,
      ...updated,
      updatedAt: new Date().toISOString()
    }
    await updateDoc(docRef, payload)
    const idx = assets.value.findIndex(a => a.id === updated.id)
    if (idx !== -1) assets.value[idx] = { ...assets.value[idx], ...payload }
  }

  // Delete asset
  async function deleteAsset(id) {
    const docRef = doc(db, 'assets', id)
    await deleteDoc(docRef)
    assets.value = assets.value.filter(a => a.id !== id)
  }

  // Record usage and update status
  async function recordUsage(assetId, activityId, status = 'in-use') {
    const docRef = doc(db, 'assets', assetId)
    const snap = await getDoc(docRef)
    if (!snap.exists()) return
    const data = snap.data()
    const history = Array.isArray(data.usageHistory)
      ? [...new Set([...data.usageHistory, activityId])]
      : [activityId]
    const payload = {
      usageHistory: history,
      status,
      updatedAt: new Date().toISOString()
    }
    await updateDoc(docRef, payload)
    const idx = assets.value.findIndex(a => a.id === assetId)
    if (idx !== -1) assets.value[idx] = { ...assets.value[idx], ...payload }
  }

  // Specific usage statuses
  function recordScheduledUsage(assetId, activityId) {
    return recordUsage(assetId, activityId, 'akan digunakan')
  }
  function recordInUse(assetId, activityId) {
    return recordUsage(assetId, activityId, 'in-use')
  }
  function recordAvailable(assetId) {
    return recordUsage(assetId, null, 'tersedia')
  }

  // Increment quantity (e.g. on purchase)
  async function incrementQuantity(assetName, delta = 1) {
    const asset = assets.value.find(a => a.name.toLowerCase() === assetName.toLowerCase())
    if (asset) {
      await updateAsset({ id: asset.id, quantity: (asset.quantity || 0) + delta })
    } else {
      await addAsset({ name: assetName, type: 'consumable', quantity: delta })
    }
  }

  // Service asset: reset status and update last serviced date
  async function serviceAsset(assetId) {
    await updateAsset({ id: assetId, status: 'tersedia', lastServicedAt: new Date().toISOString() })
  }

  // Remove usage entry
  async function removeUsage(assetId, activityId) {
    const docRef = doc(db, 'assets', assetId)
    const snap = await getDoc(docRef)
    if (!snap.exists()) return
    const data = snap.data()
    const history = Array.isArray(data.usageHistory)
      ? data.usageHistory.filter(id => id !== activityId)
      : []
    const payload = { usageHistory: history, updatedAt: new Date().toISOString() }
    await updateDoc(docRef, payload)
    const idx = assets.value.findIndex(a => a.id === assetId)
    if (idx !== -1) assets.value[idx] = { ...assets.value[idx], ...payload }
  }

  return {
    assets,
    assetToEdit,
    isLoading,
    error,
    fetchAssets,
    addAsset,
    setAssetToEdit,
    updateAsset,
    deleteAsset,
    recordUsage,
    recordScheduledUsage,
    recordInUse,
    recordAvailable,
    incrementQuantity,
    serviceAsset,
    removeUsage
  }
})
