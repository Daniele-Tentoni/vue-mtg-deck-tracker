import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'home',
      path: '/',
      redirect: '/pauper',
    },
    {
      name: 'trio',
      path: '/trio',
      component: () => import('@/views/trio/TeamTrioView.vue'),
    },
    {
      name: 'format',
      path: '/:format',
      children: [
        {
          path: '',
          name: 'format-home',
          component: () => import('@/views/ArchetypesView.vue'),
          children: [],
        },
        {
          name: 'deck-home',
          path: ':deck',
          component: () => import('@/views/DeckView.vue'),
        },
      ],
    },
    {
      name: 'users',
      path: '/users/me',
      component: () => import('../views/users/MeView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: '404',
      component: () => import('@/views/others/NotFoundView.vue'),
    },
  ],
});

export default router;
