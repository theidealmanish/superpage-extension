// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
	build: {
		rollupOptions: {
			input: {
				popup: path.resolve(__dirname, 'index.html'), // the popup
			},
		},
		outDir: 'dist',
		emptyOutDir: true,
	},
});
