import type { NextConfig } from "next";
import path from "node:path";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/user_dashboard";
const legacyBasePaths = ["/dashboard", "/dahboard"].filter(
  (path) => path !== basePath,
);
const externalRedirect = {
  basePath: false as const,
  permanent: false,
};

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  basePath,
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    root: path.resolve(__dirname),
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: basePath,
        ...externalRedirect,
      },
      ...legacyBasePaths.flatMap((legacyPath) => [
        {
          source: legacyPath,
          destination: basePath,
          ...externalRedirect,
        },
        {
          source: `${legacyPath}/:path*`,
          destination: `${basePath}/:path*`,
          ...externalRedirect,
        },
      ]),
    ];
  },
};

export default nextConfig;
