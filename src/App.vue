<template>
  <div class="app">
    <ShaderBackground />
    <NavBar />
    <div class="overlay">
      <main>
        <router-view />
      </main>
      <footer>Scheduler App © 2025</footer>
    </div>
  </div>
</template>

<script setup>
import ShaderBackground from './components/ShaderBackground.vue';
import NavBar from './components/NavBar.vue';
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000817;  /* Dark blue background */
}

.app {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.overlay {
  position: relative;
  padding-top: 60px; /* Navbar height */
  z-index: 1;
  width: 100%;
  height: 100vh; /* Use viewport height */
  display: flex;
  flex-direction: column;
  color: white;
  box-sizing: border-box; /* Include padding in height calculation */
}

header {
  padding: 2rem;
  font-size: 2rem;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

main {
  flex: 1;
  overflow-y: auto; /* Add scroll for overflow content */
  padding: 20px;
  margin-top: 20px; /* Add spacing below navbar */
    display: flex;
  flex-direction: column;
  align-items: center;
}

footer {
  padding: 1rem;
  width: 100%;
  text-align: center; /* Center the footer text */
  margin-top: auto; /* Push footer to bottom */
  position: sticky;
  bottom: 0;
  background: rgba(16, 24, 64, 0.3); /* Optional: better visibility */
  backdrop-filter: blur(5px);
}
</style>