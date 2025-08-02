<template>
  <div class="section__content section__content--p30 mt-5">
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-12">
          <h3 class="title-5 m-b-35">Verifikasi Akun Pending</h3>

          <div class="table-responsive table-responsive-data2">
            <table class="table table-data2">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td colspan="3" class="text-center">Memuat data...</td>
                </tr>
                <tr v-else-if="pendingUsers.length === 0">
                  <td colspan="3" class="text-center">Tidak ada akun pending.</td>
                </tr>
                <tr
                  v-else
                  v-for="user in pendingUsers"
                  :key="user.id"
                  class="tr-shadow"
                >
                  <td>{{ user.username }}</td>
                  <td><span class="block-email">{{ user.email }}</span></td>
                  <td>
                    <div class="table-data-feature" style="justify-content: flex-start; gap: .5rem;">
                      <button
                        class="item"
                        title="Approve"
                        @click="approveUser(user.id)"
                      >
                        <i class="zmdi zmdi-check"></i>
                      </button>
                      <button
                        class="item"
                        title="Reject"
                        @click="rejectUser(user.id)"
                      >
                        <i class="zmdi zmdi-close"></i>
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore'
import { db } from '@/firebase'

// State
const pendingUsers = ref([])
const loading      = ref(true)
let unsubscribe    = null

// Real-time fetch users dengan status 'pending'
onMounted(() => {
  const q = query(
    collection(db, 'users'),
    where('status', '==', 'pending')
  )
  unsubscribe = onSnapshot(
    q,
    snap => {
      pendingUsers.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
    err => {
      console.error('Error fetching pending users:', err)
      loading.value = false
    }
  )
})

onBeforeUnmount(() => {
  if (typeof unsubscribe === 'function') unsubscribe()
})

// Approve user: ubah status ke 'active'
const approveUser = async (id) => {
  if (!confirm('Setujui akun ini?')) return
  try {
    await updateDoc(doc(db, 'users', id), { status: 'active' })
    alert('Akun disetujui.')
  } catch (err) {
    console.error('Gagal approve:', err)
  }
}

// Reject user: hapus dokumen
const rejectUser = async (id) => {
  if (!confirm('Tolak dan hapus akun ini?')) return
  try {
    await deleteDoc(doc(db, 'users', id))
    alert('Akun ditolak dan dihapus.')
  } catch (err) {
    console.error('Gagal reject:', err)
  }
}
</script>

<style scoped>
/* Styling opsional untuk margin */
.table-responsive-data2 {
  margin-top: 1rem;
}
</style>
