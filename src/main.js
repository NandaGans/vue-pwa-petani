import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { auth } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { useActivityStore } from './stores/activityStore'
import { startDailySyncScheduler } from '@/utils/scheduler'

const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

const authStore = useAuthStore()

onAuthStateChanged(auth, async (user) => {
  if (user) {
    authStore.setUser(user)
    await authStore.fetchUserRole(user.uid)

    // ✅ Baru jalankan setelah login
    const activityStore = useActivityStore()
    await activityStore.syncStatusAktivitasDanAset()
    startDailySyncScheduler()
  } else {
    authStore.setUser(null)
  }

  app.mount('#app')
})

