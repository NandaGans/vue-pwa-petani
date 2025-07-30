<template>
  <div class="section__content section__content--p30 mt-5">
    <div class="container-fluid">
      <div class="row">
        <div class="col-lg-12">
          <div class="card">
            <div class="card-header">
              <strong>Tambah Aktivitas</strong>
            </div>
            <div class="card-body card-block">
              <form @submit.prevent="submitForm" class="form-horizontal">
                <!-- Judul -->
                <div class="row form-group">
                  <div class="col col-md-3"><label class="form-control-label">Judul</label></div>
                  <div class="col-12 col-md-9">
                    <input
                      v-model="form.title"
                      @blur="detectKeyword"
                      type="text"
                      class="form-control"
                      placeholder="Judul aktivitas"
                      required
                    />
                  </div>
                </div>

                <!-- Tanggal -->
                <div class="row form-group">
                  <div class="col col-md-3"><label class="form-control-label">Tanggal</label></div>
                  <div class="col-12 col-md-9">
                    <input
                      v-model="form.date"
                      type="date"
                      class="form-control"
                      required
                    />
                  </div>
                </div>

                <!-- Deskripsi -->
                <div class="row form-group">
                  <div class="col col-md-3"><label class="form-control-label">Deskripsi</label></div>
                  <div class="col-12 col-md-9">
                    <textarea
                      v-model="form.description"
                      rows="3"
                      class="form-control"
                      placeholder="Deskripsikan aktivitas..."
                    ></textarea>
                  </div>
                </div>

                <!-- Kategori Aktivitas -->
                <div class="row form-group">
                  <div class="col col-md-3"><label class="form-control-label">Kategori</label></div>
                  <div class="col-12 col-md-9">
                    <select v-model="form.category" class="form-control" required>
                      <option disabled value="">Pilih kategori</option>
                      <option value="tanam">Penanaman</option>
                      <option value="panen">Panen</option>
                      <option value="pemupukan">Pemupukan</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                <!-- Kategori Kustom -->
                <div class="row form-group" v-if="form.category === 'lainnya'">
                  <div class="col col-md-3"><label class="form-control-label">Tulis Kategori</label></div>
                  <div class="col-12 col-md-9">
                    <input
                      v-model="form.customCategory"
                      type="text"
                      class="form-control"
                      placeholder="Kategori kustom..."
                    />
                  </div>
                </div>

                <!-- Filter Tipe Aset -->
                <div class="row form-group">
                  <div class="col col-md-3"><label class="form-control-label">Tipe Aset</label></div>
                  <div class="col-12 col-md-9">
                    <select v-model="filterAssetType" class="form-control">
                      <option value="">Semua Tipe</option>
                      <option value="tool">Alat</option>
                      <option value="consumable">Bahan Habis Pakai</option>
                    </select>
                  </div>
                </div>

                <!-- Pilih Aset -->
                <div class="row form-group">
                  <div class="col col-md-3"><label class="form-control-label">Gunakan Aset</label></div>
                  <div class="col-12 col-md-9">
                    <select
                      v-model="form.relatedAssetId"
                      class="form-control"
                    >
                      <option value="">Tidak ada</option>
                      <option
                        v-for="asset in filteredAssets"
                        :key="asset.id"
                        :value="asset.id"
                      >
                        {{ asset.name }} ({{ asset.quantity }})
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Biaya Otomatis / Manual -->
                <div class="row form-group">
                  <div class="col col-md-3"><label class="form-control-label">Biaya (IDR)</label></div>
                  <div class="col-12 col-md-9">
                    <input
                      v-model.number="form.amount"
                      type="number"
                      class="form-control"
                      :placeholder="matched ? 'Otomatis: ' + formatCurrency(matched.defaultAmount) : 'Masukkan biaya'"
                    />
                    <small v-if="matched" class="text-muted">
                      Berdasar keyword "{{ matched.keyword }}", harga default:
                      {{ formatCurrency(matched.defaultAmount) }}
                    </small>
                  </div>
                </div>

                <!-- Catatan -->
                <div class="row form-group">
                  <div class="col col-md-3"><label class="form-control-label">Catatan</label></div>
                  <div class="col-12 col-md-9">
                    <textarea
                      v-model="form.note"
                      rows="2"
                      class="form-control"
                      placeholder="Catatan tambahan (opsional)"
                    ></textarea>
                  </div>
                </div>

              </form>
            </div>

            <div class="card-footer">
              <button
                class="btn btn-primary btn-sm"
                :disabled="isSubmitting"
                @click="submitForm"
              >
                <i class="fa fa-dot-circle-o"></i> Simpan
              </button>
              <button
                class="btn btn-danger btn-sm ml-3"
                :disabled="isSubmitting"
                @click="resetForm"
              >
                <i class="fa fa-ban"></i> Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { useActivityStore } from '@/stores/activityStore'
import { useAssetStore } from '@/stores/assetStore'
import { useAutoKeywordStore } from '@/stores/autoFinanceKeywordStore'

const router = useRouter()
const activityStore = useActivityStore()
const assetStore = useAssetStore()
const keywordStore = useAutoKeywordStore()

const assets = computed(() => assetStore.assets)
const filterAssetType = ref('')
const filteredAssets = computed(() =>
  assets.value.filter(a =>
    (!filterAssetType.value || a.type === filterAssetType.value)
  )
)
const isSubmitting = ref(false)

// Form initial state
const form = ref({
  title: '',
  date: dayjs().format('YYYY-MM-DD'),
  description: '',
  category: '',
  customCategory: '',
  relatedAssetId: '',
  amount: null,
  note: ''
})

// Matched keyword
const matched = computed(() => keywordStore.findMatch(form.value.title) || null)

// Detect keyword on blur
function detectKeyword() {
  if (matched.value && !form.value.amount) {
    form.value.amount = matched.value.defaultAmount
    form.value.category = matched.value.category
  }
}

function formatCurrency(val) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val)
}

async function submitForm() {
  const title = form.value.title.trim()
  const finalCategory = form.value.category === 'lainnya'
    ? form.value.customCategory.trim()
    : form.value.category

  if (!title || !form.value.date || !finalCategory) {
    return alert('Mohon lengkapi semua data wajib!')
  }

  isSubmitting.value = true
  try {
    await activityStore.addActivity({
      title,
      date: form.value.date,
      description: form.value.description.trim(),
      category: finalCategory,
      relatedAssetId: form.value.relatedAssetId || null,
      amount: form.value.amount,
      note: form.value.note.trim()
    })
    resetForm()
    router.push('/user/aktivitas')
  } catch (e) {
    console.error('Gagal menyimpan:', e)
    alert('Terjadi kesalahan saat menyimpan.')
  } finally {
    isSubmitting.value = false
  }
}

function resetForm() {
  form.value = {
    title: '',
    date: dayjs().format('YYYY-MM-DD'),
    description: '',
    category: '',
    customCategory: '',
    relatedAssetId: '',
    amount: null,
    note: ''
  }
}

onMounted(() => {
  assetStore.fetchAssets()
  keywordStore.fetchKeywords()
})
</script>
