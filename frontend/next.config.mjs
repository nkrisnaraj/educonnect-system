/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production';

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: isDev
              ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sandbox.payhere.lk https://www.payhere.lk;"
              : "script-src 'self' https://sandbox.payhere.lk https://www.payhere.lk;"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
