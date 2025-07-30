<template>
  <div class="section__content section__content--p30">
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-12">
          <h3 class="title-5 m-b-35 mt-5">Manajemen User</h3>

          <div class="table-data__tool">
            <div class="table-data__tool-right">
              <router-link
                :to="{ name: 'UserCreate' }"
                class="au-btn au-btn-icon au-btn--green au-btn--small"
              >
                <i class="zmdi zmdi-plus"></i>Tambah User
              </router-link>
            </div>
          </div>

          <div class="table-responsive table-responsive-data2">
            <table class="table table-data2">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="user in users"
                  :key="user.id"
                  class="tr-shadow"
                >
                  <td>{{ user.username }}</td>
                  <td>
                    <span class="block-email">{{ user.email }}</span>
                  </td>
                  <td>{{ user.role }}</td>
                  <td>
                    <div class="table-data-feature" style="justify-content: flex-start;">
                      <router-link
                        :to="{ name: 'UserEdit', params: { id: user.id } }"
                        class="item"
                        title="Edit"
                      >
                        <i class="zmdi zmdi-edit"></i>
                      </router-link>
                      <button
                        class="item"
                        title="Hapus"
                        @click="deleteUser(user.id)"
                      >
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
import { ref, onMounted } from 'vue'
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore'
import { db } from '@/firebase'

// State
const users = ref([])

// Ambil data dari Firestore
const fetchUsers = async () => {
try {
    const userQuery = query(
    collection(db, 'users'),
    where('role', '==', 'user') // hanya ambil user dengan role 'user'
    )
    const snapshot = await getDocs(userQuery)
    users.value = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
    }))
} catch (error) {
    console.error('Gagal memuat data user:', error)
}
}

// Hapus user berdasarkan ID
const deleteUser = async (id) => {
  const konfirmasi = confirm('Yakin ingin menghapus user ini?')
  if (!konfirmasi) return

  try {
    await deleteDoc(doc(db, 'users', id))
    await fetchUsers() // Refresh daftar
  } catch (error) {
    console.error('Gagal menghapus user:', error)
  }
}

// Fetch saat komponen dimount
onMounted(() => {
  fetchUsers()
})
</script>
