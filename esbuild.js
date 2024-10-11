const { build } = require('esbuild')

build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.cjs',
  bundle: true,
  minify: true,
  sourcemap: false,
  platform: 'node',
  target: 'node18',
})
