<template>
  <div class="section__content section__content--p30 mt-5">
    <div class="container-fluid">
      <div class="row">
        <div class="col">
          <div class="calendar-container">
            <div id="calendar"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useActivityStore } from '@/stores/activityStore'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

const activityStore = useActivityStore()

onMounted(() => {
  const calendarEl = document.getElementById('calendar')

  const calendar = new Calendar(calendarEl, {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth'
    },
    events: activityStore.activities.map(act => ({
      title: `${act.title} (${act.category})`,
      start: act.date,
      allDay: true,
      backgroundColor: getCategoryColor(act.category),
      borderColor: getCategoryColor(act.category)
    })),
    eventClick: (info) => {
      alert(`📌 Judul: ${info.event.title}\n📅 Tanggal: ${info.event.startStr}`)
    }
  })

  calendar.render()
})

// 🔵 Warna per kategori (opsional)
function getCategoryColor(category) {
  switch (category) {
    case 'tanam': return '#3cba54'
    case 'panen': return '#f4c20d'
    case 'pemupukan': return '#db3236'
    default: return '#3366cc'
  }
}
</script>

<style scoped>
.calendar-container {
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.fc-toolbar-title {
  font-size: 20px;
  font-weight: 600;
}
</style>
