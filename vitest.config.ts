import { fileURLToPath } from 'node:url';
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config';

export default defineConfig((config) => {
  const resolvedViteConfig = typeof viteConfig === 'function' ? viteConfig(config) : viteConfig;

  return mergeConfig(
    resolvedViteConfig,
    defineConfig({
      test: {
        environment: 'jsdom',
        exclude: [...configDefaults.exclude, 'e2e/**'],
        root: fileURLToPath(new URL('./', import.meta.url)),
      },
    }),
  );
});
