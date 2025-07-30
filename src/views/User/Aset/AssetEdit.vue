<template>
  <div class="section__content section__content--p30 mt-5">
    <div class="container-fluid">
      <div class="row">
        <div class="col-lg-12">
          <div class="card">
            <div class="card-header">
              <strong>Edit Aset</strong>
            </div>

            <template v-if="form">
              <div class="card-body card-block">
                <form @submit.prevent="submitForm" class="form-horizontal">

                  <!-- Nama -->
                  <div class="row form-group">
                    <div class="col col-md-3">
                      <label class="form-control-label">Nama Aset</label>
                    </div>
                    <div class="col-12 col-md-9">
                      <input v-model="form.name" type="text" class="form-control" required />
                    </div>
                  </div>

                  <!-- Tipe -->
                  <div class="row form-group">
                    <div class="col col-md-3">
                      <label class="form-control-label">Tipe Aset</label>
                    </div>
                    <div class="col-12 col-md-9">
                      <select v-model="form.type" class="form-control" required>
                        <option disabled value="">Pilih tipe</option>
                        <option value="tool">Alat</option>
                        <option value="consumable">Bahan Habis Pakai</option>
                      </select>
                    </div>
                  </div>

                  <!-- Quantity -->
                  <div class="row form-group">
                    <div class="col col-md-3">
                      <label class="form-control-label">Jumlah Unit</label>
                    </div>
                    <div class="col-12 col-md-9">
                      <input v-model.number="form.quantity" type="number" min="0" class="form-control" required />
                    </div>
                  </div>

                  <!-- Harga Beli Default -->
                  <div class="row form-group">
                    <div class="col col-md-3">
                      <label class="form-control-label">Harga Beli Default (IDR)</label>
                    </div>
                    <div class="col-12 col-md-9">
                      <input v-model.number="form.defaultPurchasePrice" type="number" min="0" class="form-control" />
                    </div>
                  </div>

                  <!-- Harga Sewa Default -->
                  <div class="row form-group">
                    <div class="col col-md-3">
                      <label class="form-control-label">Harga Sewa Default (IDR)</label>
                    </div>
                    <div class="col-12 col-md-9">
                      <input v-model.number="form.defaultRentalPrice" type="number" min="0" class="form-control" />
                    </div>
                  </div>

                  <!-- Status -->
                  <div class="row form-group">
                    <div class="col col-md-3">
                      <label class="form-control-label">Status</label>
                    </div>
                    <div class="col-12 col-md-9">
                      <select v-model="form.status" class="form-control" required>
                        <option disabled value="">Pilih status</option>
                        <option value="tersedia">Tersedia</option>
                        <option value="akan digunakan">Akan Digunakan</option>
                        <option value="in-use">Digunakan</option>
                        <option value="butuh servis">Butuh Servis</option>
                      </select>
                    </div>
                  </div>

                  <!-- Terakhir Servis -->
                  <div class="row form-group">
                    <div class="col col-md-3">
                      <label class="form-control-label">Terakhir Servis</label>
                    </div>
                    <div class="col-12 col-md-9">
                      <input v-model="form.lastServicedAt" type="date" class="form-control" />
                    </div>
                  </div>

                </form>
              </div>

              <div class="card-footer text-right">
                <button class="btn btn-success btn-sm" @click="submitForm">
                  <i class="fa fa-check"></i> Simpan
                </button>
                <button class="btn btn-secondary btn-sm ml-3" @click="cancelEdit">
                  <i class="fa fa-arrow-left"></i> Batal
                </button>
              </div>
            </template>

            <template v-else>
              <div class="card-body text-center text-muted p-4">
                Data aset tidak ditemukan.
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAssetStore } from '@/stores/assetStore'

const route = useRoute()
const router = useRouter()
const assetStore = useAssetStore()

const form = ref(null)
const isLoading = ref(false)

onMounted(async () => {
  isLoading.value = true
  await assetStore.fetchAssets()
  const id = route.params.id
  const asset = assetStore.assets.find(a => a.id === id)
  if (asset) {
    form.value = {
      id: asset.id,
      name: asset.name,
      type: asset.type || 'tool',
      quantity: asset.quantity,
      defaultPurchasePrice: asset.defaultPurchasePrice || 0,
      defaultRentalPrice: asset.defaultRentalPrice || 0,
      status: asset.status,
      lastServicedAt: asset.lastServicedAt ? asset.lastServicedAt.split('T')[0] : ''
    }
  } else {
    alert('Aset tidak ditemukan.')
    router.replace('/user/aset')
  }
  isLoading.value = false
})

function cancelEdit() {
  router.back()
}

async function submitForm() {
  if (!form.value.name || form.value.quantity == null || !form.value.status || !form.value.type) {
    alert('Mohon lengkapi semua isian wajib!')
    return
  }
  const payload = {
    id: form.value.id,
    name: form.value.name.trim(),
    type: form.value.type,
    quantity: form.value.quantity,
    defaultPurchasePrice: form.value.defaultPurchasePrice,
    defaultRentalPrice: form.value.defaultRentalPrice,
    status: form.value.status,
    lastServicedAt: form.value.lastServicedAt ? new Date(form.value.lastServicedAt).toISOString() : null
  }
  await assetStore.updateAsset(payload)
  router.push('/user/aset')
}
</script>
