<template>
  <div class="section__content section__content--p30 mt-5">
    <div class="container-fluid">
      <div class="row">
        <div class="col-lg-12">
          <div class="card">
            <div class="card-header">
              <strong>Master Harga Otomatis</strong>
            </div>
            <div class="card-body">
              <!-- Form Tambah / Edit Keyword -->
              <form @submit.prevent="onSubmit" class="form-inline mb-4">
                <div class="form-group mr-2">
                  <label class="mr-2">Keyword</label>
                  <input v-model="form.keyword" type="text" class="form-control" placeholder="contoh: beli pupuk" required />
                </div>
                <div class="form-group mr-2">
                  <label class="mr-2">Kategori</label>
                  <select v-model="form.category" class="form-control" required>
                    <option disabled value="">Pilih kategori</option>
                    <option value="pembelian">Pembelian</option>
                    <option value="sewa">Sewa</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
                <div class="form-group mr-2">
                  <label class="mr-2">Harga Default (IDR)</label>
                  <input v-model.number="form.defaultAmount" type="number" class="form-control" placeholder="0" required />
                </div>
                <button type="submit" class="btn btn-primary mr-2">
                  <i :class="form.id ? 'fa fa-save' : 'fa fa-plus'" />
                  {{ form.id ? 'Update' : 'Tambah' }}
                </button>
                <button v-if="form.id" type="button" class="btn btn-secondary" @click="resetForm">
                  <i class="fa fa-ban" /> Batal
                </button>
              </form>

              <!-- Tabel Daftar Keywords -->
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Keyword</th>
                      <th>Kategori</th>
                      <th>Harga Default</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="isLoading">
                      <td colspan="5" class="text-center">Memuat data...</td>
                    </tr>
                    <tr v-else-if="keywords.length === 0">
                      <td colspan="5" class="text-center">Belum ada data.</td>
                    </tr>
                    <tr v-else v-for="(kw, idx) in keywords" :key="kw.id">
                      <td>{{ idx + 1 }}</td>
                      <td>{{ kw.keyword }}</td>
                      <td>{{ kw.category }}</td>
                      <td>{{ formatCurrency(kw.defaultAmount) }}</td>
                      <td>
                        <button class="btn btn-sm btn-info mr-1" @click="editKeyword(kw)">
                          <i class="fa fa-edit" />
                        </button>
                        <button class="btn btn-sm btn-danger" @click="deleteKeyword(kw.id)">
                          <i class="fa fa-trash" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAutoKeywordStore } from '@/stores/autoFinanceKeywordStore'
// eslint-disable-next-line

const keywordStore = useAutoKeywordStore()
const isLoading = ref(true)

const form = ref({ id: null, keyword: '', category: '', defaultAmount: 0 })

const keywords = computed(() => keywordStore.keywords)

// Load data
onMounted(async () => {
  await keywordStore.fetchKeywords()
  isLoading.value = false
})

function resetForm() {
  form.value = { id: null, keyword: '', category: '', defaultAmount: 0 }
}

async function onSubmit() {
  const { id, keyword, category, defaultAmount } = form.value
  if (!keyword.trim()) return
  if (id) {
    await keywordStore.updateKeyword({ id, keyword, category, defaultAmount })
  } else {
    await keywordStore.addKeyword({ keyword, category, defaultAmount })
  }
  resetForm()
}

function editKeyword(kw) {
  form.value = { id: kw.id, keyword: kw.keyword, category: kw.category, defaultAmount: kw.defaultAmount }
}

async function deleteKeyword(id) {
  if (confirm('Yakin ingin menghapus keyword ini?')) {
    await keywordStore.deleteKeyword(id)
  }
}

function formatCurrency(val) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val)
}
</script>
