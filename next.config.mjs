/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Allow GSAP (ships ESM) to be optimized in the server/client boundary cleanly.
  transpilePackages: ["gsap", "@gsap/react"],
};

export default nextConfig;
