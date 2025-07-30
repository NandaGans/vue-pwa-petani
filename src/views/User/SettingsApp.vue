<template>
  <AppLayout>
    <div class="main-content">
      <div class="section__content section__content--p30">
        <div class="container-fluid">
          <h3 class="title-5 m-b-35">Pengaturan Aplikasi</h3>

          <!-- Pengaturan Nama -->
          <div class="card">
            <div class="card-header"><strong>Akun</strong></div>
            <div class="card-body card-block">
              <div class="form-group">
                <label for="username">Nama Pengguna</label>
                <input
                  type="text"
                  id="username"
                  v-model="username"
                  placeholder="Masukkan nama"
                  class="form-control"
                />
              </div>
              <button class="btn btn-primary" @click="simpanNama">Simpan Nama</button>
            </div>
          </div>

          <!-- Pengaturan Data -->
          <div class="card mt-4">
            <div class="card-header"><strong>Data</strong></div>
            <div class="card-body card-block">
              <p>Hapus semua aktivitas yang sudah dicatat.</p>
              <button class="btn btn-danger" @click="hapusSemuaAktivitas">Hapus Semua Aktivitas</button>
            </div>
          </div>

          <!-- Tema -->
          <div class="card mt-4">
            <div class="card-header"><strong>Tampilan</strong></div>
            <div class="card-body card-block">
              <div class="form-group">
                <label>Mode Tampilan</label><br />
                <select class="form-control" v-model="theme" @change="simpanTema">
                  <option value="light">Terang</option>
                  <option value="dark">Gelap</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Sinkronisasi -->
          <div class="card mt-4">
            <div class="card-header"><strong>Sinkronisasi</strong></div>
            <div class="card-body card-block">
              <p>Sinkronkan data ke cloud Firebase secara manual.</p>
              <button class="btn btn-success" @click="sinkronkanFirebase">Sinkronkan Sekarang</button>
            </div>
          </div>

          <!-- Ekspor Data -->
          <div class="card mt-4">
            <div class="card-header"><strong>Backup Data</strong></div>
            <div class="card-body card-block">
              <p>Ekspor semua data aktivitas ke file JSON.</p>
              <button class="btn btn-secondary" @click="eksporData">Ekspor ke JSON</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/Layouts/AppLayout.vue'
import { ref, onMounted } from 'vue'
import { useActivityStore } from '@/stores/activityStore'

const activityStore = useActivityStore()
const username = ref('')
const theme = ref('light')

onMounted(() => {
  username.value = localStorage.getItem('username') || ''
  theme.value = localStorage.getItem('theme') || 'light'
  applyTheme()
})

function simpanNama() {
  localStorage.setItem('username', username.value)
  alert('Nama berhasil disimpan!')
}

function hapusSemuaAktivitas() {
  if (confirm('Apakah Anda yakin ingin menghapus semua aktivitas?')) {
    activityStore.clearActivities()
    alert('Semua aktivitas telah dihapus.')
  }
}

function simpanTema() {
  localStorage.setItem('theme', theme.value)
  applyTheme()
  alert(`Tema diubah ke ${theme.value}`)
}

function applyTheme() {
  document.body.classList.remove('light', 'dark')
  document.body.classList.add(theme.value)
}

function sinkronkanFirebase() {
  // simulasi saja - ganti dengan real Firebase sync
  alert('Data berhasil disinkronkan ke Firebase!')
}

function eksporData() {
  const dataStr = JSON.stringify(activityStore.activities, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'aktivitas_petani_backup.json'
  link.click()
}
</script>

<style scoped>
.card {
  margin-bottom: 20px;
}
</style>
