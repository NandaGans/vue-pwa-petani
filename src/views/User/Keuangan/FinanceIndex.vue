<template>
  <div class="section__content section__content--p30 mt-5">
    <!-- Saldo Saat Ini -->
    <div class="row justify-content-center mb-4">
      <div class="col-md-3">
        <div class="card bg-light p-3 text-center">
          <h5 class="text-muted">Saldo Saat Ini</h5>
          <h3 :class="netBalance >= 0 ? 'text-success' : 'text-danger'">
            {{ formatRupiah(netBalance) }}
          </h3>
        </div>
      </div>
    </div>

    <!-- Filter & Aksi -->
    <div class="row mb-3">
      <div class="col-md-12 d-flex flex-wrap align-items-center gap-2">
        <input type="text" v-model="search" placeholder="Cari keterangan..." class="form-control w-auto" />
        <select v-model="filterType" class="form-control w-auto">
          <option value="">Semua Tipe</option>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </select>
        <select v-model="filterCategory" class="form-control w-auto">
          <option value="">Semua Kategori</option>
          <option value="tanam">Tanam</option>
          <option value="panen">Panen</option>
          <option value="pupuk">Pupuk</option>
          <option value="lainnya">Lainnya</option>
        </select>
        <div class="ml-auto d-flex gap-2">
          <button class="btn btn-success" @click="goToAdd">
            <i class="zmdi zmdi-plus"></i> Tambah Keuangan
          </button>
          <button class="btn btn-outline-secondary" @click="exportToExcel">
            <i class="zmdi zmdi-download"></i> Ekspor Excel
          </button>
        </div>
      </div>
    </div>

    <!-- Tabel Data Keuangan -->
    <div class="row">
      <div class="col-md-12">
        <div class="table-responsive table-responsive-data2">
          <table class="table table-data2">
            <thead>
              <tr>
                <th>No</th>
                <th>Jumlah</th>
                <th>Tipe</th>
                <th>Kategori</th>
                <th>Tanggal</th>
                <th>Catatan</th>
                <th>Aktivitas Terkait</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td colspan="8" class="text-center text-muted">Memuat data keuangan...</td>
              </tr>
              <tr v-else-if="filteredFinance.length === 0">
                <td colspan="8" class="text-center text-muted">Tidak ada data keuangan ditemukan.</td>
              </tr>
              <tr v-else v-for="(item, index) in filteredFinance" :key="item.id">
                <td>{{ index + 1 }}</td>
                <td>{{ formatRupiah(item.amount) }}</td>
                <td>
                  <span :class="item.type === 'income' ? 'text-success' : 'text-danger'">
                    {{ item.type === 'income' ? 'Pemasukan' : 'Pengeluaran' }}
                  </span>
                </td>
                <td>{{ item.category }}</td>
                <td>{{ item.date }}</td>
                <td>{{ item.note || '-' }}</td>
                <td>{{ activityMap[item.relatedActivityId] || '-' }}</td>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFinanceStore } from '@/stores/financeStore'
import { useActivityStore } from '@/stores/activityStore'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const financeStore = useFinanceStore()
const activityStore = useActivityStore()
const router = useRouter()

const search = ref('')
const filterType = ref('')
const filterCategory = ref('')
const isLoading = ref(false)

// Data
const finances = computed(() => financeStore.finances)
const activities = computed(() => activityStore.activities)
const activityMap = computed(() => {
  const map = {}
  activities.value.forEach(a => { map[a.id] = a.title })
  return map
})

// Fetch data
onMounted(async () => {
  isLoading.value = true
  await financeStore.fetchFinances()
  await activityStore.fetchActivities()
  isLoading.value = false
})

// Filtered list
const filteredFinance = computed(() =>
  finances.value.filter(f =>
    (!search.value || f.category.toLowerCase().includes(search.value.toLowerCase()) || (f.note && f.note.toLowerCase().includes(search.value.toLowerCase()))) &&
    (!filterType.value || f.type === filterType.value) &&
    (!filterCategory.value || f.category === filterCategory.value)
  )
)

// Net balance
const netBalance = computed(() =>
  finances.value.reduce((acc, f) => acc + (f.type === 'income' ? f.amount : -f.amount), 0)
)

// Actions
function editItem(item) {
  financeStore.setFinanceToEdit(item)
  router.push(`/user/keuangan/edit/${item.id}`)
}

function deleteItem(id) {
  if (confirm('Yakin ingin menghapus data ini?')) {
    financeStore.deleteFinance(id)
  }
}

function goToAdd() {
  router.push('/user/keuangan/create')
}

function exportToExcel() {
  const data = filteredFinance.value.map(f => ({
    Jumlah: f.amount,
    Tipe: f.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    Kategori: f.category,
    Tanggal: f.date,
    Catatan: f.note || '-',
    Aktivitas: activityMap.value[f.relatedActivityId] || '-'
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Keuangan')
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'data_keuangan.xlsx')
}

// Format Rupiah
function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount)
}
</script>
