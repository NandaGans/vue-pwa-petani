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
              <form @submit.prevent="handleRegister">
                <div class="form-group">
                  <label>Username</label>
                  <input
                    class="au-input au-input--full"
                    type="text"
                    v-model="username"
                    placeholder="Username"
                    required
                  />
                </div>
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
                    <input type="checkbox" v-model="agree" />
                    Agree to the terms and policy
                  </label>
                </div>
                <button
                  class="au-btn au-btn--block au-btn--green m-b-20"
                  type="submit"
                  :disabled="!agree || authStore.loading"
                >
                  Register
                </button>

                <div class="text-red-500 text-sm" v-if="authStore.error">
                  {{ authStore.error }}
                </div>

                <div class="register-link mt-4">
                  <p>
                    Already have an account?
                    <router-link to="/login">Sign In</router-link>
                  </p>
                </div>
              </form>

              <!-- Optional Social Buttons (Non-functional) -->
              <div class="social-login-content mt-4">
                <div class="social-button">
                  <button class="au-btn au-btn--block au-btn--blue m-b-20" disabled>
                    Register with Facebook
                  </button>
                  <button class="au-btn au-btn--block au-btn--blue2" disabled>
                    Register with Twitter
                  </button>
                </div>
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
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const email = ref('')
const password = ref('')
const username = ref('')
const agree = ref(false)

const authStore = useAuthStore()
const router = useRouter()

const handleRegister = async () => {
  await authStore.register(email.value, password.value)
  if (authStore.user) {
    // Tambahan: Anda bisa menyimpan 'username' ke Firestore di sini jika dibutuhkan
    router.push('/user')
  }
}
</script>
