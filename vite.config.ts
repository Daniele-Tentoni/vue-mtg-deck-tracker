import { fileURLToPath, URL } from 'node:url';

import { defineConfig, PluginOption } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import vuetify from 'vite-plugin-vuetify';

const definePlugins = (mode: string) => {
  const plugins: PluginOption[] = [vue(), vuetify({ autoImport: { labs: true } })];
  if (mode === 'development') {
    plugins.push(vueDevTools());
  }

  return plugins;
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: definePlugins(mode),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}));
