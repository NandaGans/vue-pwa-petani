// src/utils/checkAssetUsageToday.js
import { getDocs, collection, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import dayjs from 'dayjs'

export async function updateAssetStatusByToday() {
  const today = dayjs().format('YYYY-MM-DD')
  const snapshot = await getDocs(collection(db, 'activities'))

  for (const docSnap of snapshot.docs) {
    const activity = docSnap.data()
    // eslint-disable-next-line
    const activityId = docSnap.id

    if (activity.date === today && activity.relatedAssetId) {
      const assetDoc = doc(db, 'assets', activity.relatedAssetId)
      await updateDoc(assetDoc, { status: 'in-use' })
    }

    if (activity.status === 'selesai' && activity.relatedAssetId) {
      const assetDoc = doc(db, 'assets', activity.relatedAssetId)
      await updateDoc(assetDoc, { status: 'available' })
    }
  }
}
