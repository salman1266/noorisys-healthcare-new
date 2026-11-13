// Force single worker thread to prevent Windows sandbox EPERM mkdir race conditions
process.env.NEXT_CPU_NUM = '1';

import fs from 'fs';
import path from 'path';

// Ensure required output directories exist upfront to prevent Windows webpack race conditions
const dirsToPrecreate = [
  '.next/static/chunks',
  '.next/static/css',
  '.next/server/app',
  '.next/types/app',
];
for (const dir of dirsToPrecreate) {
  try {
    fs.mkdirSync(path.resolve(process.cwd(), dir), { recursive: true });
  } catch (e) {}
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
};

export default nextConfig;
