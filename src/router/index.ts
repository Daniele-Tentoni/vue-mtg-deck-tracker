import ArchetypesView from '@/views/ArchetypesView.vue';
import DeckView from '@/views/DeckView.vue';
import NotFoundView from '@/views/others/NotFoundView.vue';
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
      name: 'format',
      path: '/:format',
      children: [
        {
          path: '',
          name: 'format-home',
          component: ArchetypesView,
          children: [],
        },
        {
          name: 'deck-home',
          path: ':deck',
          component: DeckView,
        },
      ],
    },
    {
      name: 'users',
      path: '/users/me',
      component: () => import('../views/users/MeView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: '404',
      component: NotFoundView,
    },
  ],
});

export default router;
