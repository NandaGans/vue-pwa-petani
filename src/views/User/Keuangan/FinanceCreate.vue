<template>
  <div class="section__content section__content--p30 mt-5">
    <div class="container-fluid">
      <div class="row">
        <div class="col-lg-12">
          <div class="card">
            <div class="card-header">
              <strong>Tambah Catatan Keuangan</strong>
            </div>
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
                    <textarea v-model="form.note" class="form-control" placeholder="Opsional"></textarea>
                  </div>
                </div>

                <!-- Terkait Aktivitas -->
                <div class="row form-group">
                <div class="col col-md-3"><label class="form-control-label">Aktivitas Terkait</label></div>
                <div class="col-12 col-md-9">
                    <select v-model="form.relatedActivityId" class="form-control">
                    <option value="">(Tidak terkait)</option>
                    <option v-for="act in activityList" :key="act.id" :value="act.id">
                        {{ act.title }} - {{ act.date }}
                    </option>
                    </select>
                </div>
                </div>

              </form>
            </div>

            <div class="card-footer">
              <button class="btn btn-primary btn-sm" @click="submitForm">
                <i class="fa fa-dot-circle-o"></i> Simpan
              </button>
              <button class="btn btn-secondary btn-sm ml-3" @click="resetForm">
                <i class="fa fa-undo"></i> Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useFinanceStore } from '@/stores/financeStore'
import { useActivityStore } from '@/stores/activityStore'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

const financeStore = useFinanceStore()
const activityStore = useActivityStore()
const router = useRouter()

const form = ref({
  amount: 0,
  type: '',
  category: '',
  date: dayjs().format('YYYY-MM-DD'),
  note: '',
  relatedActivityId: ''
})

// Ambil daftar aktivitas (untuk dropdown)
const activityList = computed(() => activityStore.activities)

onMounted(() => {
  activityStore.fetchActivities()
})

async function submitForm() {
  if (!form.value.amount || !form.value.type || !form.value.category || !form.value.date) {
    alert('Harap lengkapi semua field wajib.')
    return
  }

  const newFinance = {
    amount: form.value.amount,
    type: form.value.type,
    category: form.value.category,
    date: form.value.date,
    note: form.value.note?.trim() || '',
    relatedActivityId: form.value.relatedActivityId?.trim() || null
  }

  try {
    await financeStore.addFinance(newFinance)
    resetForm()
    router.push('/user/keuangan')
  } catch (err) {
    console.error('❌ Gagal menambahkan keuangan:', err)
    alert('Gagal menyimpan catatan keuangan. Pastikan Anda sudah login.')
  }
}

function resetForm() {
  form.value = {
    amount: 0,
    type: '',
    category: '',
    date: dayjs().format('YYYY-MM-DD'),
    note: '',
    relatedActivityId: ''
  }
}
</script>
