import ArchetypesView from '@/views/ArchetypesView.vue';
import DeckView from '@/views/DeckView.vue';
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
  ],
});

export default router;
