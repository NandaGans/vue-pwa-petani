<template>
  <div class="page-wrapper">
    <div class="page-content--bge5">
      <div class="container">
        <div class="login-wrap">
          <div class="login-content">
            <div class="login-logo">
              <a href="#">
                <img src="@/assets/logo.png" alt="CoolAdmin" />
              </a>
            </div>
            <div class="login-form">
              <form @submit.prevent="handleLogin">
                <div class="form-group">
                  <label>Email Address</label>
                  <input
                    class="au-input au-input--full"
                    type="email"
                    v-model="email"
                    placeholder="Email"
                    required
                  />
                </div>
                <div class="form-group">
                  <label>Password</label>
                  <input
                    class="au-input au-input--full"
                    type="password"
                    v-model="password"
                    placeholder="Password"
                    required
                  />
                </div>
                <div class="login-checkbox">
                  <label>
                    <input type="checkbox" v-model="remember" />
                    Remember Me
                  </label>
                  <label>
                    <a href="#">Forgotten Password?</a>
                  </label>
                </div>
                <button
                  class="au-btn au-btn--block au-btn--green m-b-20"
                  type="submit"
                  :disabled="authStore.loading"
                >
                  {{ authStore.loading ? 'Signing in...' : 'Sign In' }}
                </button>
              </form>

              <div class="text-red-500 text-sm mt-2" v-if="authStore.error">
                {{ authStore.error }}
              </div>

              <div class="register-link mt-4">
                <p>
                  Don't have an account?
                  <router-link to="/register">Sign Up Here</router-link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>   
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const remember = ref(false)

const authStore = useAuthStore()
const router = useRouter()

const handleLogin = async () => {
  try {
    console.log('[Login] Tombol diklik')
    await authStore.login(email.value, password.value)

    if (authStore.user && authStore.role) {
      console.log('[Login] Role:', authStore.role)
      if (authStore.role === 'admin') {
        router.push('/admin')
      } else if (authStore.role === 'user') {
        router.push('/user')
      } else {
        console.warn('[Login] Role tidak dikenali:', authStore.role)
      }
    } else {
      console.warn('[Login] Login gagal atau role kosong')
    }
  } catch (err) {
    console.error('[Login] Error:', err.message)
  }
}
</script>
