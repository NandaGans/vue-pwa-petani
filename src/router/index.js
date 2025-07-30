import { useAuthStore } from '@/stores/authStore'
import { createRouter, createWebHistory } from 'vue-router'

import Dashboard from '@/views/Admin/Dashboard/DashboardPage.vue'
/*import AddActivity from '@/views/User/AddActivity.vue'
import ActivityList from '@/views/User/ActivityList.vue'
import ActivityCalendar from '@/views/User/ActivityCalendar.vue'
import SettingsApp from '@/views/User/SettingsApp.vue'

*/

// router/index.js

const routes = [
  {
    path: '/',
    redirect: '/login'
  },

  // 🔐 Autentikasi
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Auth/LoginForm.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Auth/RegisterForm.vue')
  },

  {
    path: '/admin',
    component: () => import('@/components/Layouts/AppLayout.vue'),
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: Dashboard, // DashboardPage.vue
      },

      //Manajemn User
      {
        path: 'user',
        name: 'UserIndex',
        component: () => import('@/views/Admin/ManajemenUser/UserIndex.vue')
      },
      {
        path: 'user/create',
        name: 'UserCreate',
        component: () => import('@/views/Admin/ManajemenUser/UserCreate.vue')
      },
      {
        path: 'user/edit/:id',
        name: 'UserEdit',
        component: () => import('@/views/Admin/ManajemenUser/UserEdit.vue')
      }


    ]
  },

  // 👤 Dashboard User (Petani)
  {
    
    path: '/user',
    component: () => import('@/components/Layouts/AppLayout.vue'),
    meta: { requiresAuth: true, role: 'user' },
    children: [
      {
        path: '',
        name: 'UserDashboard',
        component: () => import('@/views/User/Dashboard/DashboardPage.vue')
      },
            {
        path: 'aktivitas',
        name: 'ActivityIndex',
        component: () => import('@/views/User/Aktivitas/ActivityIndex.vue')
      },
      {
        path: 'aktivitas/create',
        name: 'ActivityCreate',
        component: () => import('@/views/User/Aktivitas/ActivityCreate.vue')
      },
      {
        path: 'aktivitas/edit/:id',
        name: 'ActivityEdit',
        component: () => import('@/views/User/Aktivitas/ActivityEdit.vue'),
        props: true // agar id langsung bisa diterima sebagai prop
      },
      {
        path: 'calendar',
        name: 'CalendarIndex',
        component: () => import('@/views/User/Kalender/CalendarIndex.vue')
      },
      {
        path: 'keuangan',
        name: 'FinanceIndex',
        component: () => import('@/views/User/Keuangan/FinanceIndex.vue')
      },
      {
        path: 'keuangan/create',
        name: 'FinanceCreate',
        component: () => import('@/views/User/Keuangan/FinanceCreate.vue')
      },
      {
        path: 'keuangan/edit/:id',
        name: 'FinanceEdit',
        component: () => import('@/views/User/Keuangan/FinanceEdit.vue'),
        props: true
      },
      {
        path: 'aset',
        name: 'AssetIndex',
        component: () => import('@/views/User/Aset/AssetIndex.vue')
      },
      {
        path: 'aset/create',
        name: 'AssetCreate',
        component: () => import('@/views/User/Aset/AssetCreate.vue')
      },
      {
        path: 'aset/edit/:id',
        name: 'AssetEdit',
        component: () => import('@/views/User/Aset/AssetEdit.vue'),
        props: true
      },
      {
        path: 'master',
        name: 'MasterIndex',
        component: () => import('@/views/User/Master/MasterIndex.vue')
      },
    /*
      { path: 'aktivitas/tambah', name: 'CatatAktivitas', component: () => import('@/views/User/CatatAktivitas.vue') },
      { path: 'aktivitas', name: 'DaftarAktivitas', component: () => import('@/views/User/DaftarAktivitas.vue') },
      { path: 'kalender', name: 'KalenderAktivitas', component: () => import('@/views/User/Kalender.vue') },
      { path: 'keuangan', name: 'Keuangan', component: () => import('@/views/User/Keuangan.vue') },
      { path: 'aset', name: 'KelolaAset', component: () => import('@/views/User/Aset.vue') },
      { path: 'penjualan', name: 'Penjualan', component: () => import('@/views/User/Penjualan.vue') },
      { path: 'pengaturan', name: 'PengaturanUser', component: () => import('@/views/User/Pengaturan.vue') } */
    ]
  },


  // 🛠️ Dashboard Admin
 
  

  // 🧾 Halaman Tidak Ditemukan
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/* 🚦 Middleware Global: Cek Login */
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuth = !!authStore.user
  const hasRole = !!authStore.role

  if (to.meta.requiresAuth && (!isAuth || !hasRole)) {
    next('/login')
  } else {
    next()
  }
})

export default router
