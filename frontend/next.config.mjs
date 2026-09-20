/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  // Emits <route>/index.html instead of <route>.html, so any static host
  // (S3, CloudFront, Amplify) resolves clean URLs via directory-index
  // behavior without needing platform-specific rewrite rules.
  trailingSlash: true,
};

export default nextConfig;
