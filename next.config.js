/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/fundone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.figma.com",
        pathname: "/api/mcp/asset/**",
      },
    ],
  },
};

module.exports = nextConfig;
