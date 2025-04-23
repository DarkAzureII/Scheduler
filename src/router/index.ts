import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/Dashboard.vue')
    },
    {
      path: '/schedule',
      name: 'schedule',
      component: () => import('../views/CalendarView.vue')
    },
    { 
      path: '/goals',
      name: 'goals',
      component: () => import('../views/Goals.vue') 
    },
    { 
      path: '/learning',
      name: 'learning',
      component: () => import('../views/Learning.vue') 
    },
    { 
      path: '/stats',
      name: 'stats',
      component: () => import('../views/Stats.vue') 
    },
    {
      path: '/codex',
      name: 'codex',
      component: () => import('../views/CodexJournal.vue')
    },
  ]
});

export default router;