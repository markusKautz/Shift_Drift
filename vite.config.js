import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
    plugins: [vue()],
    publicDir: 'public',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                game: resolve(__dirname, 'game.html'),
            },
        },
    },
    server: {
        open: true,
        host: true,
        watch: {
            usePolling: true
        }
    },
});
