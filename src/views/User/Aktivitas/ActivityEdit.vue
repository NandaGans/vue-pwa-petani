<template>
  <div class="section__content section__content--p30 mt-5">
    <div class="container-fluid">
      <div class="row">
        <div class="col-lg-12">
          <div class="card">
            <div class="card-header">
              <strong>Edit Aktivitas</strong> Petani
            </div>

            <template v-if="form">
              <div class="card-body card-block">
                <form @submit.prevent="submitEdit" class="form-horizontal">
                  <!-- Judul -->
                  <div class="row form-group">
                    <div class="col col-md-3"><label class="form-control-label">Judul</label></div>
                    <div class="col-12 col-md-9">
                      <input v-model="form.title" type="text" class="form-control" required />
                    </div>
                  </div>

                  <!-- Tanggal -->
                  <div class="row form-group">
                    <div class="col col-md-3"><label class="form-control-label">Tanggal</label></div>
                    <div class="col-12 col-md-9">
                      <input v-model="form.date" type="date" class="form-control" required />
                    </div>
                  </div>

                  <!-- Kategori -->
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
                      <input v-model="form.customCategory" class="form-control" placeholder="Kategori khusus" />
                    </div>
                  </div>

                  <!-- Aset -->
                  <div class="row form-group">
                    <div class="col col-md-3"><label class="form-control-label">Aset</label></div>
                    <div class="col-12 col-md-9">
                      <select v-model="form.relatedAssetId" class="form-control">
                        <option value="">Tidak ada</option>
                        <option v-for="asset in assets" :key="asset.id" :value="asset.id">
                          {{ asset.name }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <!-- Biaya -->
                  <div class="row form-group">
                    <div class="col col-md-3"><label class="form-control-label">Biaya (IDR)</label></div>
                    <div class="col-12 col-md-9">
                      <input v-model.number="form.amount" type="number" class="form-control" placeholder="Masukkan jumlah biaya (opsional)" />
                    </div>
                  </div>

                  <!-- Keuangan Otomatis -->
                  <div class="row form-group" v-if="finance">
                    <div class="col col-md-3"><label class="form-control-label">Keuangan Otomatis</label></div>
                    <div class="col-12 col-md-9">
                      <p class="mb-0">{{ formatCurrency(finance.amount) }} ({{ finance.category }})</p>
                    </div>
                  </div>

                  <!-- Status -->
                  <div class="row form-group">
                    <div class="col col-md-3"><label class="form-control-label">Status</label></div>
                    <div class="col-12 col-md-9">
                      <select v-model="form.status" class="form-control" required>
                        <option value="dijadwalkan">Dijadwalkan</option>
                        <option value="berlangsung">Berlangsung</option>
                        <option value="tertunda">Tertunda</option>
                        <option value="selesai">Selesai</option>
                        <option value="dibatalkan">Dibatalkan</option>
                      </select>
                    </div>
                  </div>

                  <!-- Catatan -->
                  <div class="row form-group">
                    <div class="col col-md-3"><label class="form-control-label">Catatan</label></div>
                    <div class="col-12 col-md-9">
                      <textarea v-model="form.note" class="form-control" rows="3" placeholder="Evaluasi lapangan (opsional)"></textarea>
                    </div>
                  </div>
                </form>
              </div>

              <div class="card-footer">
                <button class="btn btn-success btn-sm" @click="submitEdit">
                  <i class="fa fa-check"></i> Simpan
                </button>
                <button class="btn btn-secondary btn-sm ml-3" @click="router.back()">
                  <i class="fa fa-arrow-left"></i> Kembali
                </button>
              </div>
            </template>

            <template v-else>
              <div class="card-body text-center text-muted p-4">
                Tidak ada data untuk diedit.
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useActivityStore } from '@/stores/activityStore'
import { useAssetStore } from '@/stores/assetStore'
import { useFinanceStore } from '@/stores/financeStore'

const router = useRouter()
const route = useRoute()
const activityStore = useActivityStore()
const assetStore = useAssetStore()
const financeStore = useFinanceStore()

const assets = computed(() => assetStore.assets)
const form = ref(null)
const finance = computed(() => (
  form.value?.financeId
    ? financeStore.finances.find(f => f.id === form.value.financeId)
    : null
))

// Populate form based on route param ID
onMounted(async () => {
  // load related data
  await activityStore.fetchActivities()
  await assetStore.fetchAssets()
  financeStore.fetchFinances?.()

  // set form
  const id = route.params.id
  const act = activityStore.activities.find(a => a.id === id)
  if (act) {
    activityStore.setActivityToEdit(act)
  } else {
    alert('Aktivitas tidak ditemukan.')
    router.replace('/user/aktivitas')
  }
})

// Watch store for editing target
watch(() => activityStore.activityToEdit, val => {
  form.value = val ? { ...val } : null
})

function formatCurrency(val) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val)
}

function submitEdit() {
  if (!form.value) return
  if (form.value.category === 'lainnya' && !form.value.customCategory?.trim()) {
    return alert('Kategori khusus wajib diisi!')
  }
  // assign custom category if any
  if (form.value.category === 'lainnya') {
    form.value.category = form.value.customCategory.trim()
  }
  activityStore.updateActivity(form.value)
  router.push('/user/aktivitas')
}
</script>
