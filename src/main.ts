// My extensions
import './types/array.ext';

// Styles
import 'vuetify/styles';
import '@fortawesome/fontawesome-free/css/all.css';

// Vuetify
import { createVuetify } from 'vuetify';
import { aliases, fa } from 'vuetify/iconsets/fa';
import { md3 } from 'vuetify/blueprints';

const vuetify = createVuetify({
  blueprint: md3,
  icons: {
    defaultSet: 'fa',
    aliases,
    sets: {
      fa,
    },
  },
});

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(vuetify);

app.mount('#app');
