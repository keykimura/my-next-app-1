/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // @mapbox/node-pre-gypのHTMLファイルを無視
    config.module.rules.push({
      test: /node-pre-gyp/,
      loader: 'ignore-loader'
    });

    return config;
  },
  // CSSモジュールを有効化
  cssModules: true,
  // スタイルシートの処理を設定
  images: {
    domains: ['localhost'],
  },
  // 開発サーバーの設定
  reactStrictMode: true,
};

export default nextConfig;
