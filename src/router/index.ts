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
      name: 'tournaments',
      path: '/tournaments',
      component: () => import('@/views/tournament/TournamentsView.vue'),
    },
    {
      path: '/users',
      children: [
        {
          path: 'me',
          name: 'me',
          component: () => import('@/views/users/MeView.vue'),
          children: [
            {
              path: 'decks',
              name: 'my-decks',
              component: () => import('@/views/users/MyDecksView.vue'),
            },
            {
              path: 'identities',
              name: 'my-identities',
              component: () => import('@/views/users/MyIdentitiesView.vue'),
            },
          ],
        },
        {
          path: ':id',
          name: 'user-profile',
          component: () => import('@/views/users/UserView.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: '404',
      component: NotFoundView,
    },
  ],
});

export default router;
