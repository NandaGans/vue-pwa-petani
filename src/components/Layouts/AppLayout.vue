<template>
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Page Container -->
    <div class="page-container2">
      <!-- Header Desktop -->
      <AppHeaderDesktop />

      <!-- Header Mobile -->
      <AppHeaderMobile />

      <!-- Breadcrumb -->
      <AppBreadcrumb />

      <!-- Main Content Slot -->
      <main>
        <router-view />
      </main>


      <!-- Footer -->
      <AppFooter />
    </div>
</template>

<script setup>
// Import komponen layout
import AppHeaderMobile from '@/components/Layouts/AppHeaderMobile.vue'
import AppSidebar from '@/components/Layouts/AppSidebar.vue'
import AppHeaderDesktop from '@/components/Layouts/AppHeaderDesktop.vue'
import AppFooter from '@/components/Layouts/AppFooter.vue'
import AppBreadcrumb from './AppBreadcrumb.vue'
</script>

