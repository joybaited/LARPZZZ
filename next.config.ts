import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
