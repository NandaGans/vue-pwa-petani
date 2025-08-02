<template>
  <div class="section__content section__content--p30">
    <div class="container-fluid">
      <h3 class="title-5 m-b-35 mt-5">Pengaturan Admin</h3>

      <!-- Navigation Tabs -->
      <ul class="nav nav-pills mb-4">
        <li class="nav-item">
          <a href="#" class="nav-link" :class="{ active: activeTab === 'profile' }" @click.prevent="activeTab = 'profile'">Profil</a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link" :class="{ active: activeTab === 'emailTemplate' }" @click.prevent="activeTab = 'emailTemplate'">Template Email</a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link" :class="{ active: activeTab === 'dataManagement' }" @click.prevent="activeTab = 'dataManagement'">Data</a>
        </li>
      </ul>

      <!-- Tab Content -->
      <div v-if="activeTab === 'profile'">
        <!-- Profil Admin -->
        <form @submit.prevent="updateProfile">
          <div class="form-group">
            <label>Nama</label>
            <input v-model="profile.name" class="form-control" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="profile.email" type="email" class="form-control" required />
          </div>
          <div class="form-group">
            <label>Password Baru</label>
            <input v-model="profile.newPassword" type="password" class="form-control" placeholder="Kosongkan kalau tidak ganti" />
          </div>
          <button type="submit" class="btn btn-primary">Simpan Profil</button>
        </form>
      </div>

      <div v-else-if="activeTab === 'emailTemplate'">
        <!-- Template Email -->
        <form @submit.prevent="saveTemplate">
          <div class="form-group">
            <label>Subjek Email</label>
            <input v-model="template.subject" class="form-control" placeholder="Subjek email" />
          </div>
          <div class="form-group">
            <label>Isi Email</label>
            <textarea v-model="template.body" rows="6" class="form-control" placeholder="Isi template email"></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Simpan Template</button>
        </form>
      </div>

      <div v-else>
        <!-- Data Management -->
        <div class="mb-3">
          <button class="btn btn-warning mr-2" @click="backupData">
            <i class="zmdi zmdi-cloud-upload"></i> Backup Data
          </button>
          <button class="btn btn-info" @click="exportAllData">
            <i class="zmdi zmdi-download"></i> Export Semua Data
          </button>
        </div>
        <div v-if="backupUrl">
          <a :href="backupUrl" class="btn btn-success" download>Unduh File Backup</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAuth, updateEmail, updatePassword } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import axios from 'axios'

// State
const activeTab = ref('profile')

// Auth & Profil
const auth = getAuth()
const profile = ref({ name: '', email: '', newPassword: '' })

// Template Email
const template = ref({ subject: '', body: '' })

// Backup URL
const backupUrl = ref('')

// Fetch initial data
onMounted(async () => {
  const uid = auth.currentUser.uid
  // Load admin profile
  try {
    const snap = await getDoc(doc(db, 'admins', uid))
    if (snap.exists()) {
      profile.value.name = snap.data().name || ''
    }
    profile.value.email = auth.currentUser.email
  } catch (err) {
    console.error('Error fetching profile:', err)
  }
  // Load email template
  try {
    const snapTpl = await getDoc(doc(db, 'settings', 'emailTemplate'))
    if (snapTpl.exists()) {
      template.value.subject = snapTpl.data().subject || ''
      template.value.body    = snapTpl.data().body || ''
    }
  } catch (err) {
    console.error('Error fetching email template:', err)
  }
})

// Update profile handler
const updateProfile = async () => {
  try {
    const uid = auth.currentUser.uid
    // Update Firestore name
    await setDoc(doc(db, 'admins', uid), { name: profile.value.name }, { merge: true })
    // Update Auth email
    if (profile.value.email !== auth.currentUser.email) {
      await updateEmail(auth.currentUser, profile.value.email)
    }
    // Update Auth password
    if (profile.value.newPassword) {
      await updatePassword(auth.currentUser, profile.value.newPassword)
    }
    alert('Profil berhasil diperbarui')
  } catch (err) {
    console.error('Error updating profile:', err)
    alert('Gagal memperbarui profil: ' + err.message)
  }
}

// Save email template handler
const saveTemplate = async () => {
  try {
    await setDoc(doc(db, 'settings', 'emailTemplate'), {
      subject:  template.value.subject,
      body:     template.value.body,
      updatedAt: serverTimestamp()
    }, { merge: true })
    alert('Template email disimpan')
  } catch (err) {
    console.error('Error saving template:', err)
    alert('Gagal menyimpan template: ' + err.message)
  }
}

// Backup & Export handlers
const backupData = async () => {
  try {
    const res = await axios.post('/.netlify/functions/backupFirestore')
    backupUrl.value = res.data.url
  } catch (err) {
    console.error('Error backup data:', err)
    alert('Gagal backup data: ' + err.message)
  }
}

const exportAllData = () => {
   // langsung buka dan download file JSON
   window.open('/.netlify/functions/exportAllData', '_blank')
}
</script>

<style scoped>
.title-5 {
  font-size: 1.5rem;
}
</style>
