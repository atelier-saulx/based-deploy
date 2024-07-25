const { build } = require('esbuild');

build({
    entryPoints: ['src/index.ts'],
    outfile: "dist/index.js",
    bundle: true,
    minify: true,
    platform: 'node',
    target: 'node18',
    format: "esm",
})