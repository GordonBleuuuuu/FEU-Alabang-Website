/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fbqoqdljdoajbnwruicz.supabase.co",
        pathname: "/storage/v1/object/public/event-posters/**",
      },
    ],
  },
};

export default nextConfig;
