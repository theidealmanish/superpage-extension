import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const resolvePath = (p: string) => path.resolve(__dirname, p);

export default defineConfig({
	plugins: [react()],
	build: {
		target: 'esnext',
		outDir: 'dist',
		emptyOutDir: true,
		rollupOptions: {
			input: {
				popup: resolvePath('public/popup.html'),
			},
		},
		// For popup HTML build only
	},
});
