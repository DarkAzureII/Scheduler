<!-- NavBar.vue -->
<template>
    <nav class="navbar">
      <router-link to="/">Dashboard</router-link>
      <router-link to="/goals">Goals</router-link>
      <router-link to="/codex">Codex</router-link>
      <router-link to="/learning">Learning</router-link>
      <router-link to="/stats">Stats</router-link>
      <router-link to="/schedule">Schedule</router-link>
    </nav>
  </template>
  
  <script setup>
  // Add any navbar-specific logic here if needed
  </script>
  
  <style scoped>
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    padding: 1rem;
    z-index: 2;
    display: flex;
    gap: 2rem;
    justify-content: center;
    backdrop-filter: blur(10px);
    background: rgba(16, 24, 64, 0.5);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .navbar a {
    color: white;
    text-decoration: none;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: all 0.3s ease;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  }
  
  .navbar a:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }
  
  .navbar a.router-link-exact-active {
    background: rgba(255, 255, 255, 0.2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  </style>