import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/en',
        destination: '/liturgy/qiddase-dioscoros',
        permanent: false,
      },
      {
        source: '/en/:path*',
        destination: '/liturgy/qiddase-dioscoros',
        permanent: false,
      },
      {
        source: '/am/:path*',
        destination: '/liturgy/qiddase-dioscoros',
        permanent: false,
      },
      {
        source: '/gez/:path*',
        destination: '/liturgy/qiddase-dioscoros',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
