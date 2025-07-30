<template>
  <div class="section__content section__content--p30 mt-5">
    <div class="container-fluid">
      <h3 class="title-5 m-b-35">Manajemen Aset</h3>

      <!-- Ringkasan -->
      <div class="row mb-4">
        <div class="col-md-3" v-for="(count, label) in summary" :key="label">
          <div class="card bg-light p-3 text-center">
            <h6 class="text-muted">{{ label }}</h6>
            <h3 class="font-weight-bold">{{ count }} Aset</h3>
          </div>
        </div>
      </div>

      <!-- Filter dan tombol -->
      <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
        <input
          type="text"
          v-model="search"
          placeholder="Cari nama aset..."
          class="form-control w-auto"
        />
        <select v-model="filterStatus" class="form-control w-auto">
          <option value="">Semua Status</option>
          <option value="tersedia">Tersedia</option>
          <option value="akan digunakan">Akan Digunakan</option>
          <option value="in-use">Digunakan</option>
          <option value="butuh servis">Butuh Servis</option>
        </select>
        <div class="ml-auto">
          <button class="btn btn-success" @click="goToAdd">
            <i class="zmdi zmdi-plus"></i> Tambah Aset
          </button>
        </div>
      </div>

      <!-- Tabel Aset -->
      <div class="table-responsive table-responsive-data2">
        <table class="table table-data2">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Aset</th>
              <th>Jumlah</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="5" class="text-center text-muted">Memuat data aset...</td>
            </tr>
            <tr v-else-if="filteredAssets.length === 0">
              <td colspan="5" class="text-center text-muted">Tidak ada aset ditemukan.</td>
            </tr>
            <tr v-else v-for="(item, index) in filteredAssets" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.quantity }}</td>
              <td>
                <span :class="statusClass(item.status)">
                  {{ statusLabel(item.status) }}
                </span>
              </td>
              <td>
                <div class="table-data-feature">
                  <button class="item" title="Edit" @click="editItem(item)">
                    <i class="zmdi zmdi-edit"></i>
                  </button>
                  <button class="item" title="Hapus" @click="deleteItem(item.id)">
                    <i class="zmdi zmdi-delete"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAssetStore } from '@/stores/assetStore'

const assetStore = useAssetStore()
const router = useRouter()

const search = ref('')
const filterStatus = ref('')
const isLoading = ref(false)

// Fetch assets on mount
onMounted(async () => {
  isLoading.value = true
  await assetStore.fetchAssets()
  isLoading.value = false
})

// Computed list with filters
const filteredAssets = computed(() =>
  assetStore.assets.filter(a =>
    (!search.value || (a.name || '').toLowerCase().includes(search.value.toLowerCase())) &&
    (!filterStatus.value || a.status === filterStatus.value)
  )
)

// Summary counts by status
const summary = computed(() => ({
  'Tersedia':      assetStore.assets.filter(a => a.status === 'tersedia').length,
  'Akan Digunakan': assetStore.assets.filter(a => a.status === 'akan digunakan').length,
  'Digunakan':     assetStore.assets.filter(a => a.status === 'in-use').length,
  'Butuh Servis':  assetStore.assets.filter(a => a.status === 'butuh servis').length
}))

// Label mapping
function statusLabel(status) {
  switch (status) {
    case 'tersedia':      return 'Tersedia'
    case 'akan digunakan':return 'Akan Digunakan'
    case 'in-use':        return 'Digunakan'
    case 'butuh servis':  return 'Butuh Servis'
    default:              return '-'
  }
}

// Class mapping
function statusClass(status) {
  return {
    'text-success': status === 'tersedia',
    'text-info':    status === 'akan digunakan',
    'text-warning': status === 'in-use',
    'text-danger':  status === 'butuh servis'
  }
}

// Actions
function goToAdd() {
  router.push('/user/aset/create')
}

function editItem(item) {
  assetStore.setAssetToEdit(item)
  router.push(`/user/aset/edit/${item.id}`)
}

function deleteItem(id) {
  if (confirm('Yakin ingin menghapus aset ini?')) {
    assetStore.deleteAsset(id)
  }
}
</script>
