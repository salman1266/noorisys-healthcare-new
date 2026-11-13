const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure single-worker mode to avoid Windows file lock race conditions
process.env.NEXT_CPU_NUM = '1';

// Pre-create all Next.js output directories for routes
const routes = [
  '',
  'about',
  'api',
  'api/contact',
  'contact',
  'innovation',
  'privacy',
  'products',
  'products/[slug]',
  'solutions',
  'terms',
  'robots.txt',
  'sitemap.xml',
  '_not-found',
];

const bases = [
  '.next/server/app',
  '.next/static/chunks/app',
  '.next/types/app',
  '.next/static/css',
];

for (const base of bases) {
  for (const route of routes) {
    const full = path.join(process.cwd(), base, route);
    try {
      fs.mkdirSync(full, { recursive: true });
    } catch (e) {}
  }
}

const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(npxCmd, ['next', 'build', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NEXT_CPU_NUM: '1',
  },
});

process.exit(result.status !== null ? result.status : 0);
