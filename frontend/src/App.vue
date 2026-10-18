<script setup>
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <NavBar />
  <main class="main-content">
    <div class="container">
      <router-view />
    </div>
  </main>
  <Footer />
</template>
