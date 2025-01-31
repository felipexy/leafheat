// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack(config, { isServer }) {
    // Add worker loader for WebWorkers
    if (!isServer) {
      config.module.rules.push({
        test: /\.worker\.js$/,
        use: { loader: "worker-loader" },
      });
    }

    return config;
  },
};

module.exports = nextConfig;
