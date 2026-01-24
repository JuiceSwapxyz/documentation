const { description } = require("../../package");

module.exports = {
  title: "JuiceSwap",
  description: description,

  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    ["link", { rel: "apple-touch-icon", href: "/assets/favicon.png" }],
    ["meta", { name: "theme-color", content: "#FF9933" }],
    ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
    ["meta", { name: "apple-mobile-web-app-status-bar-style", content: "black" }],
    ["meta", { property: "og:image", content: "https://docs.juiceswap.xyz/assets/og_image.png" }],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "630" }],
    ["meta", { property: "og:title", content: "JuiceSwap Documentation" }],
    ["meta", { property: "og:description", content: "Official documentation for JuiceSwap - Decentralized Exchange Platform" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:url", content: "https://docs.juiceswap.xyz/" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:image", content: "https://docs.juiceswap.xyz/assets/og_image.png" }],
    ["meta", { name: "twitter:title", content: "JuiceSwap Documentation" }],
    ["meta", { name: "twitter:description", content: "Official documentation for JuiceSwap - Decentralized Exchange Platform" }],
  ],

  themeConfig: {
    repo: "JuiceSwapxyz/documentation",
    logo: "/assets/logo.png",
    editLinks: true,
    editLinkText: "Edit this page on Github",
    docsBranch: "develop",
    docsDir: "src",
    lastUpdated: true,

    nav: [
      {
        text: "JuiceSwap.xyz",
        link: "https://juiceswap.xyz/",
      },
    ],

    sidebar: [
      { title: "Overview", path: "/overview" },
      { title: "Swapping Tokens", path: "/swap" },
      { title: "Providing Liquidity", path: "/liquidity" },
      { title: "Governance", path: "/governance" },
      { title: "Smart Contracts", path: "/smart-contracts" },
      { title: "FAQ", path: "/faq" },
      { title: "Disclaimer", path: "/disclaimer" },
      { title: "Privacy", path: "/privacy" },
      { title: "Imprint", path: "/imprint" },
    ],
  },

  plugins: ["@vuepress/plugin-back-to-top", "@vuepress/plugin-medium-zoom"],

  configureWebpack: {
    plugins: [
      {
        apply: (compiler) => {
          compiler.hooks.emit.tapAsync('CopyMediaFiles', (compilation, callback) => {
            const fs = require('fs');
            const path = require('path');

            // Copy both media and media_kit directories (both in root)
            const dirsToCopy = [
              { source: path.join(__dirname, '../../media'), target: 'media' },
              { source: path.join(__dirname, '../../media_kit'), target: 'media_kit' }
            ];

            function copyRecursiveSync(src, dest) {
              const exists = fs.existsSync(src);
              const stats = exists && fs.statSync(src);
              const isDirectory = exists && stats.isDirectory();

              if (isDirectory) {
                fs.readdirSync(src).forEach((childItemName) => {
                  copyRecursiveSync(
                    path.join(src, childItemName),
                    path.join(dest, childItemName)
                  );
                });
              } else {
                const content = fs.readFileSync(src);
                compilation.assets[dest] = {
                  source: () => content,
                  size: () => content.length
                };
              }
            }

            dirsToCopy.forEach(({ source, target }) => {
              if (fs.existsSync(source)) {
                copyRecursiveSync(source, target);
              }
            });

            callback();
          });
        }
      }
    ]
  },

  chainWebpack: (config) => {
    config.module
      .rule("vue")
      .use("vue-loader")
      .tap((options) => ({
        ...options,
        compilerOptions: {
          isCustomElement: (tag) => tag.includes("juice"),
        },
      }));
  },
};