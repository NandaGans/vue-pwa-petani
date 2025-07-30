import { defineStore } from 'pinia'
import { ref } from 'vue'
import { nanoid } from 'nanoid'
import { auth, db } from '@/firebase'
import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore'
import { useAssetStore } from './assetStore'
import { useFinanceStore } from './financeStore'
import { useAutoKeywordStore } from './autoFinanceKeywordStore'
import dayjs from 'dayjs'

export const useActivityStore = defineStore('activity', () => {
  const activities = ref([])
  const activityToEdit = ref(null)
  const isLoading = ref(true)
  const error = ref(null)

  const assetStore = useAssetStore()
  const financeStore = useFinanceStore()
  const keywordStore = useAutoKeywordStore()
  const activityRef = collection(db, 'activities')

  // Fetch activities for current user
  async function fetchActivities() {
    isLoading.value = true
    error.value = null
    const user = auth.currentUser
    
    if (!user) {
      error.value = "Anda harus login untuk melihat activities"
      isLoading.value = false
      return
    }

    try {
      await assetStore.fetchAssets()
      const q = query(activityRef, where('userId', '==', user.uid))
      const snap = await getDocs(q)
      activities.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      await syncStatusAktivitasDanAset()
    } catch (e) {
      error.value = `Gagal memuat activities: ${e.message}`
      console.error("Fetch activities error:", e)
    } finally {
      isLoading.value = false
    }
  }

  // Add new activity
  async function addActivity(activity) {
      error.value = null
      const user = auth.currentUser
      
      if (!user) {
        error.value = "Anda harus login untuk menambahkan activity"
        return
      }

      try {
        const id = nanoid()
        const newAct = {
          ...activity,
          id,
          userId: user.uid, // Pastikan userId selalu ada
          status: 'dijadwalkan',
          createdAt: new Date().toISOString()
        }

        // Auto finance creation
        const titleLower = newAct.title.toLowerCase()
        const match = keywordStore.keywords.find(k => 
          titleLower.includes(k.keyword.toLowerCase())
        )
        
        if (match) {
          const amount = newAct.amount ?? match.defaultAmount
          const finId = nanoid()
          await financeStore.addFinance({
            id: finId,
            type: ['pembelian', 'sewa'].includes(match.category) ? 'expense' : 'income',
            amount,
            category: match.category,
            date: newAct.date,
            relatedActivityId: id,
            userId: user.uid
          })
          newAct.financeId = finId
          newAct.amount = amount
        }

        // Asset handling
        if (match?.category === 'pembelian') {
          const name = newAct.title.slice(
            titleLower.indexOf(match.keyword.toLowerCase()) + match.keyword.length
          ).trim() || match.keyword
          
          await assetStore.incrementQuantity(name, 1)
          const existing = assetStore.assets.find(a => 
            a.name.toLowerCase() === name.toLowerCase())
          if (existing) newAct.relatedAssetId = existing.id
        }

        if (newAct.relatedAssetId) {
          await assetStore.recordUsage(newAct.relatedAssetId, id)
        }

        await setDoc(doc(db, 'activities', id), newAct)
        activities.value.push(newAct)
        await syncStatusAktivitasDanAset()

      } catch (e) {
        error.value = `Gagal menambahkan activity: ${e.message}`
        console.error("Add activity error:", e)
        throw e
      }
    }

  // Update existing activity
  async function updateActivity(updated) {
    error.value = null
    const user = auth.currentUser
    
    if (!user) {
      error.value = "Anda harus login untuk mengupdate activity"
      return
    }

    try {
      const idx = activities.value.findIndex(a => a.id === updated.id)
      if (idx === -1) throw new Error("Activity tidak ditemukan")

      // Verifikasi kepemilikan
      if (activities.value[idx].userId !== user.uid) {
        throw new Error("Anda tidak memiliki izin untuk mengupdate activity ini")
      }

      await updateDoc(doc(db, 'activities', updated.id), updated)
      activities.value[idx] = { ...updated }
      await syncStatusAktivitasDanAset()
    } catch (e) {
      error.value = `Gagal mengupdate activity: ${e.message}`
      console.error("Update activity error:", e)
      throw e
    }
  }

  // Delete activity by ID
  async function deleteActivityById(id) {
    error.value = null
    const user = auth.currentUser
    
    if (!user) {
      error.value = "Anda harus login untuk menghapus activity"
      return
    }

    try {
      const idx = activities.value.findIndex(a => a.id === id)
      if (idx === -1) throw new Error("Activity tidak ditemukan")

      const act = activities.value[idx]
      
      // Verifikasi kepemilikan
      if (act.userId !== user.uid) {
        throw new Error("Anda tidak memiliki izin untuk menghapus activity ini")
      }

      // Handle related assets
      if (act.relatedAssetId && assetStore.removeUsage) {
        await assetStore.removeUsage(act.relatedAssetId, id)
      }

      // Handle related finance
      if (act.financeId) {
        await financeStore.deleteFinance(act.financeId)
      }

      // Delete activity
      await deleteDoc(doc(db, 'activities', id))
      activities.value.splice(idx, 1)
      await syncStatusAktivitasDanAset()

    } catch (e) {
      error.value = `Gagal menghapus activity: ${e.message}`
      console.error("Delete activity error:", e)
      throw e
    }
  }

  // Helper to change status and optionally update asset
  async function changeStatus(act, newStatus, assetStatus) {
    await updateDoc(doc(db, 'activities', act.id), { status: newStatus })
    act.status = newStatus

    if (assetStatus && act.relatedAssetId) {
      const asset = assetStore.assets.find(a => a.id === act.relatedAssetId)
      if (asset) {
        if (assetStatus === 'in-use') {
          await assetStore.recordUsage(act.relatedAssetId, act.id)
        }
        await assetStore.updateAsset({ ...asset, status: assetStatus })
      }
    }
  }

  // Synchronize activity and asset statuses
async function syncStatusAktivitasDanAset() {
  const today = dayjs().startOf('day')

  for (const act of activities.value) {
    if (!act.relatedAssetId) continue
    const asset = assetStore.assets.find(a => a.id === act.relatedAssetId)
    if (!asset) continue

    // 1. Dijadwalkan → Akan Digunakan
    if (act.status === 'dijadwalkan' && asset.status !== 'akan digunakan') {
      await assetStore.recordUsage(asset.id, act.id, 'akan digunakan')
    }

    // 2. Hari-H → In-Use
    if (act.date && dayjs(act.date).isSame(today) && act.status === 'dijadwalkan') {
      // Ubah status aktivitas → 'berlangsung'
      // Rekam lagi ke usageHistory & status → 'in-use'
      await changeStatus(act, 'berlangsung', 'in-use')
    }

    // 3. Lewat jadwal dan masih berlangsung → Tertunda
    if (act.date && dayjs(act.date).isBefore(today) && act.status === 'berlangsung') {
      await changeStatus(act, 'tertunda', /* no assetStatus */)
    }

    // 4. Selesai → Kembalikan Aset ke Tersedia
    if (act.status === 'selesai' && asset.status === 'in-use') {
      await changeStatus(act, 'selesai', 'tersedia')
    }
  }
}


  function setActivityToEdit(a) {
    activityToEdit.value = { ...a }
  }

  return {
    activities,
    activityToEdit,
    isLoading,
    error,
    fetchActivities,
    addActivity,
    updateActivity,
    deleteActivityById,
    setActivityToEdit,
    syncStatusAktivitasDanAset
  }
})
