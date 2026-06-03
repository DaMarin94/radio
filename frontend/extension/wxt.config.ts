import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@radio/shared': path.resolve(__dirname, '../shared/src'),
      },
    },
  }),
  manifest: ({ browser }) => ({
    name: 'Radio',
    description: 'Sintonizador de radio FM/AM',
    permissions: browser === 'chrome' ? ['storage', 'offscreen'] : ['storage'],
    icons: {
      16: 'icon-16.png',
      32: 'icon-32.png',
      128: 'icon-128.png',
    },
    action: {
      default_popup: 'popup.html',
      default_icon: {
        16: 'icon-16.png',
        32: 'icon-32.png',
      },
    },
  }),
});
