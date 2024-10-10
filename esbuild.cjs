const { build } = require('esbuild')

build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.cjs',
  bundle: true,
  minify: false,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  //   external: ['esbuild'],
})
