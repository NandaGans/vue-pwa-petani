<template>
  <div class="section__content section__content--p30 mt-5">
    <div class="container-fluid">
      <div class="row">
        <div class="col-lg-12">
          <div class="card">
            <div class="card-header">
              <strong>Tambah Aset</strong>
            </div>
            <div class="card-body card-block">
              <form @submit.prevent="submitForm" class="form-horizontal">
                <!-- Nama Aset -->
                <div class="row form-group">
                  <div class="col col-md-3">
                    <label class="form-control-label">Nama Aset</label>
                  </div>
                  <div class="col-12 col-md-9">
                    <input
                      v-model="form.name"
                      type="text"
                      class="form-control"
                      placeholder="Contoh: Traktor, Pupuk Urea"
                      required
                    />
                  </div>
                </div>

                <!-- Quantity -->
                <div class="row form-group">
                  <div class="col col-md-3">
                    <label class="form-control-label">Jumlah Unit</label>
                  </div>
                  <div class="col-12 col-md-9">
                    <input
                      v-model.number="form.quantity"
                      type="number"
                      min="0"
                      class="form-control"
                      placeholder="Masukkan jumlah unit"
                      required
                    />
                  </div>
                </div>

                <!-- Harga Beli Default -->
                <div class="row form-group">
                  <div class="col col-md-3">
                    <label class="form-control-label">Harga Beli Default (IDR)</label>
                  </div>
                  <div class="col-12 col-md-9">
                    <input
                      v-model.number="form.defaultPurchasePrice"
                      type="number"
                      min="0"
                      class="form-control"
                      placeholder="0"
                    />
                  </div>
                </div>

                <!-- Harga Sewa Default -->
                <div class="row form-group">
                  <div class="col col-md-3">
                    <label class="form-control-label">Harga Sewa Default (IDR)</label>
                  </div>
                  <div class="col-12 col-md-9">
                    <input
                      v-model.number="form.defaultRentalPrice"
                      type="number"
                      min="0"
                      class="form-control"
                      placeholder="0"
                    />
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

              </form>
            </div>

            <div class="card-footer">
              <button class="btn btn-success btn-sm" @click="submitForm">
                <i class="fa fa-check"></i> Simpan
              </button>
              <button class="btn btn-secondary btn-sm ml-3" @click="cancelCreate">
                <i class="fa fa-arrow-left"></i> Kembali
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAssetStore } from '@/stores/assetStore'

const router = useRouter()
const assetStore = useAssetStore()

const form = ref({
  name: '',
  quantity: 0,
  defaultPurchasePrice: 0,
  defaultRentalPrice: 0,
  status: 'tersedia'
})

function cancelCreate() {
  router.back()
}

async function submitForm() {
  if (!form.value.name.trim() || form.value.quantity == null) {
    alert('Mohon lengkapi nama dan jumlah unit aset.')
    return
  }
  try {
    await assetStore.addAsset({
      name: form.value.name.trim(),
      quantity: form.value.quantity,
      defaultPurchasePrice: form.value.defaultPurchasePrice,
      defaultRentalPrice: form.value.defaultRentalPrice
    })
    alert('Aset berhasil ditambahkan.')
    router.push('/user/aset')
  } catch (e) {
    console.error('Gagal menambahkan aset:', e)
    alert('Terjadi kesalahan saat menyimpan aset.')
  }
}
</script>
