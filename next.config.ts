import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SCALPEL-UNI-003: Strictly disable production browser source maps
  productionBrowserSourceMaps: false,

  // Next.js 16 Turbopack configuration
  turbopack: {},

  // SCALPEL-UNI-003: Remove all console calls in production builds
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },

  // SCALPEL-UNI-003: Strip comments from production bundles
  webpack: (config, { isServer, dev }) => {
    if (!dev && !isServer && config.optimization?.minimizer) {
      config.optimization.minimizer.forEach((minimizer: any) => {
        if (minimizer?.constructor?.name === "TerserPlugin") {
          minimizer.options = minimizer.options || {};
          minimizer.options.terserOptions = {
            ...minimizer.options.terserOptions,
            format: {
              ...minimizer.options.terserOptions?.format,
              comments: false,
            },
          };
        }
      });
    }
    return config;
  },

  /* the model, the hdri and the fonts are content-addressed by hand: the
     filename changes when the asset does. so they can be cached hard.
     3D.md listed immutable headers as an outstanding load-speed lever —
     this is it. nothing else in /public is covered, deliberately: the
     videos and images are still being swapped. */
  async headers() {
    return [
      {
        source: "/:path(models|hdri|fonts)/:file*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
