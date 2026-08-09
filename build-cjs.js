import { build } from 'esbuild';
import { builtinModules } from 'module';
import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
const dependencies = Object.keys(pkg.dependencies || {});
const peerDependencies = Object.keys(pkg.peerDependencies || {});
const bundleDependencies = new Set(['whatsapp-rust-bridge', 'whatsapp-rust-bridge-baron']);
const allExternal = [
  ...dependencies.filter(name => !bundleDependencies.has(name)),
  ...peerDependencies,
  ...builtinModules,
  'pino',
  'jimp',
  'sharp'
];

async function runBuild() {
  console.log('Building bundled CommonJS output...');
  
  await build({
    entryPoints: ['lib/index.js'],
    outfile: 'lib/index.cjs',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node20',
    external: allExternal,
    logLevel: 'info',
  });

  console.log('CommonJS build completed successfully!');
}

runBuild().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
