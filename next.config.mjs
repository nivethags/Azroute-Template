// next.config.mjs
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['recharts'],
  sassOptions: {
    includePaths: [join(__dirname, 'styles')],
  },
  reactStrictMode: true,
};

export default nextConfig;
