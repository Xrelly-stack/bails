import { build } from 'esbuild';
import { rmSync, mkdirSync } from 'fs';

async function runBuild() {
  console.log('Building CommonJS output...');
  
  // Build lib/index.js to lib/index.cjs
  await build({
    entryPoints: ['lib/index.js'],
    outfile: 'lib/index.cjs',
    bundle: false,
    platform: 'node',
    format: 'cjs',
    target: 'node20',
  });

  console.log('CommonJS build completed successfully!');
}

runBuild().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
