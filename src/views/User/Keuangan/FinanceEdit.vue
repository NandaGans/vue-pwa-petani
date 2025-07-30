<template>
  <div class="section__content section__content--p30 mt-5">
    <div class="container-fluid">
      <div class="row">
        <div class="col-lg-12">
          <div class="card">
            <div class="card-header">
              <strong>Edit Catatan Keuangan</strong>
            </div>

            <!-- Jika data tersedia -->
            <template v-if="form">
              <div class="card-body card-block">
                <form @submit.prevent="submitForm" class="form-horizontal">
                  <!-- Jumlah -->
                  <div class="row form-group">
                    <div class="col col-md-3"><label class="form-control-label">Jumlah (Rp)</label></div>
                    <div class="col-12 col-md-9">
                      <input type="number" v-model.number="form.amount" class="form-control" required />
                    </div>
                  </div>

                  <!-- Tipe -->
                  <div class="row form-group">
                    <div class="col col-md-3"><label class="form-control-label">Tipe</label></div>
                    <div class="col-12 col-md-9">
                      <select v-model="form.type" class="form-control" required>
                        <option disabled value="">Pilih tipe</option>
                        <option value="income">Pemasukan</option>
                        <option value="expense">Pengeluaran</option>
                      </select>
                    </div>
                  </div>

                  <!-- Kategori -->
                  <div class="row form-group">
                    <div class="col col-md-3"><label class="form-control-label">Kategori</label></div>
                    <div class="col-12 col-md-9">
                      <select v-model="form.category" class="form-control" required>
                        <option disabled value="">Pilih kategori</option>
                        <option value="tanam">Tanam</option>
                        <option value="panen">Panen</option>
                        <option value="pupuk">Pupuk</option>
                        <option value="lainnya">Lainnya</option>
                      </select>
                    </div>
                  </div>

                  <!-- Tanggal -->
                  <div class="row form-group">
                    <div class="col col-md-3"><label class="form-control-label">Tanggal</label></div>
                    <div class="col-12 col-md-9">
                      <input type="date" v-model="form.date" class="form-control" required />
                    </div>
                  </div>

                  <!-- Catatan -->
                  <div class="row form-group">
                    <div class="col col-md-3"><label class="form-control-label">Catatan</label></div>
                    <div class="col-12 col-md-9">
                      <textarea v-model="form.note" class="form-control" placeholder="Catatan tambahan..." rows="2"></textarea>
                    </div>
                  </div>

                <!-- Aktivitas Terkait -->
                <div class="row form-group">
                    <div class="col col-md-3"><label class="form-control-label">Aktivitas Terkait</label></div>
                    <div class="col-12 col-md-9">
                        <select v-model="form.relatedActivityId" class="form-control">
                        <option value="">Tidak terkait aktivitas</option>
                        <option v-for="activity in activities" :key="activity.id" :value="activity.id">
                            {{ activity.title }} - {{ activity.date }}
                        </option>
                        </select>
                    </div>
                </div>

                </form>
              </div>

              <div class="card-footer">
                <button class="btn btn-success btn-sm" @click="submitForm">
                  <i class="fa fa-check"></i> Simpan
                </button>
                <button class="btn btn-secondary btn-sm ml-3" @click="router.back()">
                  <i class="fa fa-arrow-left"></i> Kembali
                </button>
              </div>
            </template>

            <!-- Jika tidak ditemukan -->
            <template v-else>
              <div class="card-body text-center text-muted p-4">
                Data tidak ditemukan atau belum dipilih untuk diedit.
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useFinanceStore } from '@/stores/financeStore'
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const financeStore = useFinanceStore()
const router = useRouter()

const form = ref(null)
const original = ref(null)

onMounted(() => {
  if (financeStore.financeToEdit) {
    form.value = { ...financeStore.financeToEdit }
    original.value = { ...financeStore.financeToEdit }
  } else {
    alert('Data tidak ditemukan. Kembali ke daftar.')
    router.push('/user/keuangan')
  }
})

watch(() => financeStore.financeToEdit, (val) => {
  if (val) {
    form.value = { ...val }
    original.value = { ...val }
  }
})

async function submitForm() {
  if (!form.value || !form.value.amount || !form.value.type || !form.value.category || !form.value.date) {
    alert('Mohon lengkapi semua field yang wajib diisi.')
    return
  }

  try {
    await financeStore.updateFinance({ ...form.value })
    router.push('/user/keuangan')
  } catch (err) {
    console.error('❌ Gagal update keuangan:', err)
    alert('Gagal memperbarui data. Pastikan Anda memiliki akses.')
  }
}

// eslint-disable-next-line
function resetForm() {
  if (original.value) {
    form.value = { ...original.value }
  }
}
</script>
