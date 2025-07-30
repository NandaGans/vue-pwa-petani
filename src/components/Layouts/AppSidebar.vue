<template>
  <aside class="menu-sidebar2">
      <div class="logo">
        <a href="#">
          <img src="/images/icon/logo-white.png" alt="PWA Petani" />
        </a>
      </div>
      <div class="menu-sidebar2__content js-scrollbar1">
          <div class="account2">
          </div>
          <nav class="navbar-sidebar2">
          <ul class="list-unstyled navbar__list">
            <!-- Untuk User -->
            <template v-if="role === 'user'">
              <li :class="{ active: isActive('/user') }">
                <router-link to="/user">
                  <i class="fas fa-tachometer-alt"></i>Dashboard
                </router-link>
              </li>
              <li :class="{ active: isActive('/user/aktivitas') }">
                <router-link to="/user/aktivitas">
                  <i class="fas fa-list"></i>Aktivitas
                </router-link>
              </li>
              <li :class="{ active: isActive('/user/calendar') }">
                <router-link to="/user/calendar">
                  <i class="fas fa-calendar"></i>Kalender Aktivitas
                </router-link>
              </li>
              <li :class="{ active: isActive('/user/keuangan') }">
                <router-link to="/user/keuangan">
                  <i class="fas fa-university"></i>Keuangan
                </router-link>
              </li>
              <li :class="{ active: isActive('/user/aset') }">
                <router-link to="/user/aset">
                  <i class="fas fa-wrench"></i>Aset
                </router-link>
              </li>
              <li :class="{ active: isActive('/user/master') }">
                <router-link to="/user/master">
                  <i class="fas fa-file"></i>Master
                </router-link>
              </li>
              <li :class="{ active: isActive('/user/pengaturan') }">
                <router-link to="/user/pengaturan">
                  <i class="fas fa-cog"></i>Pengaturan
                </router-link>
              </li>
            </template>

            <!-- Untuk Admin -->
            <template v-else-if="role === 'admin'">
              <li :class="{ active: isActive('/admin') }">
                <router-link to="/admin">
                  <i class="fas fa-tachometer-alt"></i>Dashboard
                </router-link>
              </li>
              <li :class="{ active: isActive('/admin/user') }">
                <router-link to="/admin/user">
                  <i class="fas fa-users"></i>Manajemen User
                </router-link>
              </li>
              <li :class="{ active: isActive('/admin/verifikasi') }">
                <router-link to="/admin/verifikasi">
                  <i class="fas fa-check-circle"></i>Verifikasi
                </router-link>
              </li>
              <li :class="{ active: isActive('/admin/laporan') }">
                <router-link to="/admin/laporan">
                  <i class="fas fa-file-alt"></i>Laporan
                </router-link>
              </li>
              <li :class="{ active: isActive('/admin/pengaturan') }">
                <router-link to="/admin/pengaturan">
                  <i class="fas fa-cog"></i>Pengaturan
                </router-link>
              </li>
            </template>

            <!-- Jika belum login / belum diketahui -->
            <li v-else>
              <span class="text-muted px-3">Memuat menu...</span>
            </li>
          </ul>
        </nav>
      </div>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const authStore = useAuthStore()

const isActive = (path) => route.path === path
const role = authStore.role
</script>
