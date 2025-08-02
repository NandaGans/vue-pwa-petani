<template>
  <div class="section__content section__content--p30">
    <div class="container-fluid">
      <h3 class="title-5 m-b-35 mt-5">Laporan Pengguna</h3>

      <!-- Filters: Status & Rentang Waktu -->
      <div class="row mb-3">
            <div class="col-md-2">
            <select v-model="filterStatus" class="form-control">
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="rejected">Rejected</option>
            </select>
            </div>
            <div class="col-md-2">
            <input
                type="date"
                v-model="startDate"
                class="form-control"
                placeholder="Tanggal Mulai"
            />
            </div>
            <div class="col-md-2">
            <input
                type="date"
                v-model="endDate"
                class="form-control"
                placeholder="Tanggal Selesai"
            />
            </div>

            <div class="col-md-2">
             <button class="au-btn au-btn-icon au-btn--blue au-btn--small" @click="resetFilters">
                    <i class="zmdi zmdi-refresh"></i> Reset Filter
            </button>
            </div>
            <div class="col-md-4 text-right">
                <button class="au-btn au-btn-icon au-btn--blue au-btn--small" @click="exportToExcel">
                    <i class="zmdi zmdi-download"></i> Unduh Excel
                </button>
            </div>
        </div>


      <!-- Tabel Data Pengguna -->
      <div class="table-responsive table-responsive-data2">
        <table class="table table-data2">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Status</th>
              <th>Terdaftar</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="4" class="text-center">Memuat data...</td>
            </tr>
            <tr v-else-if="filteredUsers.length === 0">
              <td colspan="4" class="text-center">Tidak ada data pengguna.</td>
            </tr>
            <tr v-else v-for="u in filteredUsers" :key="u.id" class="tr-shadow">
              <td>{{ u.username }}</td>
              <td><span class="block-email">{{ u.email }}</span></td>
              <td>{{ u.status }}</td>
              <td>{{ formatDate(u.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import * as XLSX from 'xlsx'

const users = ref([])
const loading = ref(true)
const filterStatus = ref('')
const startDate = ref('')
const endDate = ref('')
let unsubscribe = null

onMounted(() => {
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'user')
  )
  unsubscribe = onSnapshot(
    q,
    snap => {
      users.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
    err => {
      console.error('Error fetch pengguna:', err)
      loading.value = false
    }
  )
})

onBeforeUnmount(() => {
  if (unsubscribe) unsubscribe()
})

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    if (filterStatus.value && u.status !== filterStatus.value) return false
    const regDate = u.createdAt?.toDate()
    if (startDate.value) {
      const sd = new Date(startDate.value)
      if (!regDate || regDate < sd) return false
    }
    if (endDate.value) {
      const ed = new Date(endDate.value)
      ed.setHours(23,59,59)
      if (!regDate || regDate > ed) return false
    }
    return true
  })
})

function formatDate(ts) {
  if (!ts?.toDate) return '-'
  return ts.toDate().toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

const exportToExcel = () => {
  const data = filteredUsers.value.map(u => ({
    Username: u.username,
    Email:    u.email,
    Status:   u.status,
    Terdaftar: formatDate(u.createdAt)
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Users')
  XLSX.writeFile(wb, 'LaporanPengguna.xlsx')
}

const resetFilters = () => {
  filterStatus.value = ''
  startDate.value = ''
  endDate.value = ''
}
</script>

<style scoped>
.title-5 { font-size: 1.25rem }
</style>
