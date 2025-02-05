import { createRouter, createWebHistory } from 'vue-router';
import CalendarView from '../views/CalendarView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'calendar',
      component: CalendarView
    }
  ]
});

export default router;