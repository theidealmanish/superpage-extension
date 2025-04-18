import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
	const entryMap: Record<string, string> = {
		phantomBridge: 'src/injected/phantomBridge.ts',
		youtube: 'src/content/youtube.ts',
		github: 'src/content/github.ts',
	};

	// Fallback to YouTube if mode is unknown
	const entryFile = entryMap[mode] || entryMap.youtube;
	const name = mode in entryMap ? mode : 'youtube';

	return {
		plugins: [react(), tsconfigPaths()],
		build: {
			alias: {
				'@': path.resolve(__dirname, 'src'),
			},
			lib: {
				entry: path.resolve(__dirname, entryFile),
				formats: ['iife'],
				name,
				fileName: () => `${name}.js`,
			},
			outDir: 'dist',
			emptyOutDir: false, // keep popup and other build assets
			rollupOptions: {
				output: {
					entryFileNames: `${name}.js`,
				},
			},
		},
	};
});
