const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizePackageImports: ['@types/bcryptjs', '@types/jsonwebtoken'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      
      // backend paketlerini client bundledan çıkar
      config.externals = config.externals || [];
      config.externals.push({
        'mongoose': 'mongoose',
        'bcryptjs': 'bcryptjs',
        'jsonwebtoken': 'jsonwebtoken',
        'cloudinary': 'cloudinary',
        'multer': 'multer',
      });
    }
    return config;
  },
  compress: true,
  poweredByHeader: false,
  trailingSlash: false,
};

module.exports = withBundleAnalyzer(nextConfig);