import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allows the app to run behind a reverse proxy (Docker / nginx)
  output: "standalone",

  // Enable React strict mode for better development warnings
  reactStrictMode: true,
};

export default nextConfig;
