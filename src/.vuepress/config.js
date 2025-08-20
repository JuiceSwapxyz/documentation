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
    ["meta", { property: "og:image", content: "/assets/og_image.png" }],
    ["meta", { property: "og:title", content: "JuiceSwap Documentation" }],
    ["meta", { property: "og:description", content: "Official documentation for JuiceSwap - Decentralized Exchange Platform" }],
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

      { title: "Stablecoin Bridges", path: "/swap" },

      { title: "Collateralized Minting", path: "/positions",
        children: [
          "/positions/open",
          "/positions/clone",
          "/positions/adjust",
          "/positions/auctions",
        ],
      },

      { title: "Reserve", path: "/reserve",
        children: [
          "/reserve/pool-shares",
        ],
      },

      { title: "Governance", path: "/governance" },

      { title: "Telegram API Bot", path: "/telegram-api-bot" },
      { title:  "Disclaimer", path: "/disclaimer" },
      { title: "Privacy", path: "/privacy" },
      { title: "Imprint", path: "/imprint" },
      { title: "FAQ", path: "/faq" },

    ],
  },

  plugins: ["@vuepress/plugin-back-to-top", "@vuepress/plugin-medium-zoom"],

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