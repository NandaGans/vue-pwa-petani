<template>
  <!-- STATISTIC -->
  <section class="statistic">
    <div class="section__content section__content--p30">
      <div class="container-fluid">
        <div class="row">
          <!-- Total Akun -->
          <div class="col-md-6 col-lg-3">
            <div class="statistic__item">
              <h2 class="number">{{ totalUsers }}</h2>
              <span class="desc">Total Akun</span>
              <div class="icon">
                <i class="zmdi zmdi-account-o"></i>
              </div>
            </div>
          </div>
          <!-- Pending -->
          <div class="col-md-6 col-lg-3">
            <div class="statistic__item">
              <h2 class="number">{{ pendingCount }}</h2>
              <span class="desc">Pending</span>
              <div class="icon">
                <i class="zmdi zmdi-time-restore"></i>
              </div>
            </div>
          </div>
          <!-- Aktif -->
          <div class="col-md-6 col-lg-3">
            <div class="statistic__item">
              <h2 class="number">{{ activeCount }}</h2>
              <span class="desc">Aktif</span>
              <div class="icon">
                <i class="zmdi zmdi-check-circle"></i>
              </div>
            </div>
          </div>
          <!-- Ditolak -->
          <div class="col-md-6 col-lg-3">
            <div class="statistic__item">
              <h2 class="number">{{ rejectedCount }}</h2>
              <span class="desc">Ditolak</span>
              <div class="icon">
                <i class="zmdi zmdi-close-circle"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CHARTS: 2 Columns -->
  <section class="chart mt-4">
    <div class="section__content section__content--p30">
      <div class="container-fluid">
        <div class="row">
          <!-- Bar Chart Registrasi Bulanan -->
          <div class="col-md-6">
            <h3 class="title-5 m-b-20">Grafik Registrasi Bulanan</h3>
            <div class="chart-canvas-wrapper">
              <canvas ref="chartRef"></canvas>
            </div>
          </div>
          <!-- Pie Chart Aktif vs Tidak Aktif -->
          <div class="col-md-6">
            <h3 class="title-5 m-b-20">User Aktif vs Tidak Aktif (30 hari)</h3>
              <div class="chart-canvas-wrapper">
                <canvas ref="statusChartRef"></canvas>
              </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const chartRef = ref(null)
let chartInstance = null
const statusChartRef = ref(null)
let statusChartInstance = null

// Fetch users once for stats and charts
onMounted(() => {
  userStore.fetchUsersOnce('user')
})

// Computed statistics
const totalUsers    = computed(() => userStore.users.length)
const pendingCount  = computed(() => userStore.users.filter(u => u.status === 'pending').length)
const activeCount   = computed(() => userStore.users.filter(u => u.status === 'active').length)
const rejectedCount = computed(() => userStore.users.filter(u => u.status === 'rejected').length)

// Render Bar Chart: Registrasi Bulanan
watch(
  () => userStore.users,
  users => {
    if (!chartRef.value) return
    if (chartInstance) chartInstance.destroy()

    // Aggregate by month
    const counts = {}
    users.forEach(u => {
      const ts = u.createdAt?.toDate()
      if (!ts) return
      const month = ts.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })
      counts[month] = (counts[month] || 0) + 1
    })

    const labels = Object.keys(counts).sort((a, b) => new Date(a) - new Date(b))
    const data   = labels.map(l => counts[l])

    chartInstance = new Chart(chartRef.value, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Registrasi per Bulan', data }] },
      options: { scales: { y: { beginAtZero: true }, maintainAspectRatio: false  } }
    })
  },
  { immediate: true }
)

// Compute active vs inactive
const THRESHOLD_DAYS = 30
const now = new Date()
const activeUsers = computed(() =>
  userStore.users.filter(u => {
    const ts = u.lastLogin?.toDate?.()
    return ts && (now - ts) <= THRESHOLD_DAYS * 86400000
  }).length
)
const inactiveUsers = computed(() => totalUsers.value - activeUsers.value)

// Render Pie Chart: Aktif vs Tidak Aktif
watch(
  [activeUsers, inactiveUsers],
  ([act, inact]) => {
    if (!statusChartRef.value) return
    if (statusChartInstance) statusChartInstance.destroy()

    statusChartInstance = new Chart(statusChartRef.value, {
      type: 'pie',
      data: {
        labels: ['Aktif', 'Tidak Aktif'],
        datasets: [{ data: [act, inact], backgroundColor: ['#4CAF50', '#F44336'] }]
      },
      options: {
      maintainAspectRatio: false,   // <— disable ratio
      scales: { y: { beginAtZero: true } }
  }
    })
  },
  { immediate: true }
)
</script>

<style scoped>
.statistic__item .number { font-size: 2rem; }
.chart-canvas-wrapper {
  position: relative;
  height: 300px;  /* atur sesuai kebutuhan */
}
.chart-canvas-wrapper canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
