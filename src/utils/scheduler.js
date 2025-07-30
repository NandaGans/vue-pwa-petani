// src/utils/scheduler.js
import { useActivityStore } from '@/stores/activityStore'
import { watchOnce } from '@vueuse/core'
// eslint-disable-next-line
import dayjs from 'dayjs'

export function startDailySyncScheduler() {
  const activityStore = useActivityStore()

  // Jalankan sinkronisasi sekali setelah semua data selesai diambil
  watchOnce(
    () => activityStore.isLoading === false,
    async () => {
      await activityStore.syncStatusAktivitasDanAset()
    },
    { flush: 'post' }
  )

  // Jadwalkan setiap 6 jam (misal 4x sehari), idealnya menggunakan Service Worker atau Worker
  setInterval(async () => {
    console.log('[⏳] Menjalankan sinkronisasi aktivitas & aset')
    await activityStore.syncStatusAktivitasDanAset()
  }, 1000 * 60 * 60 * 6) // 6 jam
}

