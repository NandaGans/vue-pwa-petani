<template>
  <div class="section__content section__content--p30 mt-5">
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-12">
          <h3 class="title-5 m-b-35">Daftar Aktivitas</h3>

          <!-- FILTER -->
          <div class="d-flex flex-wrap gap-2 align-items-center mb-3">
            <input v-model="search" type="text" placeholder="Cari aktivitas..." class="form-control w-auto" />
            <select v-model="filterCategory" class="form-control w-auto">
              <option value="">Semua Kategori</option>
              <option value="tanam">Penanaman</option>
              <option value="panen">Panen</option>
              <option value="pemupukan">Pemupukan</option>
              <option value="lainnya">Lainnya</option>
            </select>
            <select v-model="filterStatus" class="form-control w-auto">
              <option value="">Semua Status</option>
              <option value="dijadwalkan">Dijadwalkan</option>
              <option value="berlangsung">Berlangsung</option>
              <option value="tertunda">Tertunda</option>
              <option value="selesai">Selesai</option>
            </select>
            <button class="btn btn-success" @click="goToAdd">
              <i class="zmdi zmdi-plus"></i> Tambah Aktivitas
            </button>
            <button class="btn btn-outline-secondary" @click="exportToExcel">
              <i class="zmdi zmdi-download"></i> Ekspor Excel
            </button>
          </div>

          <!-- TABEL -->
          <div class="table-responsive table-responsive-data2">
            <table class="table table-data2">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Judul</th>
                  <th>Tanggal</th>
                  <th>Deskripsi</th>
                  <th>Kategori</th>
                  <th>Status</th>
                  <th>Aset</th>
                  <th>Keuangan</th>
                  <th>Catatan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="activityStore.isLoading">
                  <td colspan="10" class="text-center text-muted">Memuat data aktivitas...</td>
                </tr>
                <tr v-else-if="filteredActivities.length === 0">
                  <td colspan="10" class="text-center text-muted">Belum ada aktivitas tercatat.</td>
                </tr>
                <tr v-else v-for="(activity, index) in filteredActivities" :key="activity.id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ activity.title }}</td>
                  <td>{{ activity.date }}</td>
                  <td>{{ activity.description || '-' }}</td>
                  <td>{{ activity.category }}</td>
                  <td>{{ activity.status }}</td>
                  <td>{{ getAssetName(activity.relatedAssetId) }}</td>
                  <td>
                    <template v-if="getFinance(activity.financeId)">
                      {{ formatCurrency(getFinance(activity.financeId).amount) }}
                      ({{ getFinance(activity.financeId).category }})
                    </template>
                    <span v-else>-</span>
                  </td>
                  <td>{{ activity.note || '-' }}</td>
                  <td>
                    <div class="table-data-feature">
                      <button class="item" title="Edit" @click="editItem(activity)">
                        <i class="zmdi zmdi-edit"></i>
                      </button>
                      <button class="item" title="Hapus" @click="deleteItem(activity.id)">
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useActivityStore } from '@/stores/activityStore'
import { useAssetStore } from '@/stores/assetStore'
import { useFinanceStore } from '@/stores/financeStore'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const activityStore = useActivityStore()
const assetStore = useAssetStore()
const financeStore = useFinanceStore()
const router = useRouter()

const search = ref('')
const filterCategory = ref('')
const filterStatus = ref('')

onMounted(() => {
  activityStore.fetchActivities()
  assetStore.fetchAssets()
  // Load finance data if method exists
  if (typeof financeStore.fetchFinances === 'function') {
    financeStore.fetchFinances()
  }
})

const activities = computed(() => activityStore.activities)
const filteredActivities = computed(() =>
  activities.value.filter(a =>
    (!search.value || a.title.toLowerCase().includes(search.value.toLowerCase())) &&
    (!filterCategory.value || a.category === filterCategory.value) &&
    (!filterStatus.value || a.status === filterStatus.value)
  )
)

function getAssetName(id) {
  if (!id) return '-'
  const asset = assetStore.assets.find(a => a.id === id)
  return asset?.name || '-'
}

function getFinance(id) {
  return financeStore.finances.find(f => f.id === id) || null
}

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)
}

function editItem(activity) {
  activityStore.setActivityToEdit(activity)
  router.push(`/user/aktivitas/edit/${activity.id}`)
}

function deleteItem(id) {
  if (confirm('Yakin ingin menghapus aktivitas ini?')) {
    activityStore.deleteActivityById(id)
  }
}

function goToAdd() {
  router.push('/user/aktivitas/create')
}

function exportToExcel() {
  const data = filteredActivities.value.map(a => ({
    Judul: a.title,
    Tanggal: a.date,
    Deskripsi: a.description || '-',
    Kategori: a.category,
    Status: a.status,
    Aset: getAssetName(a.relatedAssetId),
    Keuangan: getFinance(a.financeId)?.amount ?? '-',
    Catatan: a.note || '-'
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Aktivitas')
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'aktivitas_petani.xlsx')
}
</script>
