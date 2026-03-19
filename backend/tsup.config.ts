import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/server.ts', 'src/server.mock.ts'],
  format: ['cjs'],
  target: 'node20',
  outDir: 'dist',
  clean: true,
  splitting: false,
  sourcemap: false,
  loader: {
    '.md': 'empty',
  },
})
