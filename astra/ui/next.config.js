const { resolve, join } = require("path");
const { withSentryConfig } = require("@sentry/nextjs");

// const partytown = require("@builder.io/partytown/utils");
const { composePlugins, withNx } = require("@nx/next");
// const CopyPlugin = require("copy-webpack-plugin");

const INCLUDE = [
  resolve(__dirname, "src"),
  resolve("../../common/ui/resources")
]
/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  typescript: {
    configPath: join(__dirname, "next.tsconfig.json")
  },

  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
    tsConfigPath: join(__dirname, "next.tsconfig.json"),
  },

  compiler: {
    // For other options, see https://styled-components.com/docs/tooling#babel-plugin
    styledComponents: true,
  },

  env: {
    "API_URL": process.env["API_URL"],
    "STRIPE_CLIENT_KEY": process.env["STRIPE_CLIENT_KEY"],
  },

  transpilePackages: ["@common/ui", "@common/js"],

  webpack: (config) => {
    // config.plugins.push(
    //   new CopyPlugin({
    //     patterns: [
    //       {
    //         from: partytown.libDirPath(),
    //         to: join(__dirname, "public", "~partytown"),
    //       },
    //     ],
    //   }),
    // );

    config.module.rules.unshift({
      test: /\.(gif|woff2|ttf|svg|png|jpg)$/,
      include: INCLUDE,
      use: [
        {
          loader: "file-loader",
          options: {
            esModule: false,
            // publicPath: "/public/resources/",
            // outputPath: "public/resources",
            publicPath: "/_next/static/resources/",
            outputPath: "static/resources/",
          },
        },
      ],
    });

    return config;
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
