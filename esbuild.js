const { build } = require('esbuild');
const { dependencies } = require('./package.json')

const sharedConfig = {
    entryPoints: ['src/index.ts'],
    bundle: true,
    minify: true,
    external: Object.keys(dependencies),
}

build({
    ...sharedConfig,
    platform: 'node',
    outfile: 'dist/index.js',
})