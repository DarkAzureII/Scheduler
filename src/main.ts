import { createApp } from 'vue'
import { createPinia } from 'pinia'  // Add this import
import './style.css'
import App from './App.vue'
import router from './router/index'

// Create Pinia instance
const pinia = createPinia()

const app = createApp(App)

// Use both router and pinia
app.use(pinia)
app.use(router)

app.mount('#app')