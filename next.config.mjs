/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    // Allow images from these domains/paths
    remotePatterns: [],
    // Allow local static files
    domains: [],
  },
}

export default nextConfig
