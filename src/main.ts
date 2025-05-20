import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './styles/main.css'  // Updated path
import './styles/animations.css' // New import
import './styles/fonts.css'      // New import
import App from './App.vue'
import router from './router'
import 'vis-network/styles/vis-network.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)

app.use(router)
app.mount('#app')