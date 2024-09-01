const path = require("node:path");
const glob = require("glob-all");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { PurgeCSSPlugin } = require("purgecss-webpack-plugin");
const purgecssWordpress = require("purgecss-with-wordpress");
const TerserPlugin = require("terser-webpack-plugin");
const PATHS = {
  js: path.join(__dirname, "src/"),
  views: path.join(__dirname, "views"),
  root: __dirname,
};

console.log(PATHS.root);

module.exports = {
  mode: "production",
  entry: {
    index: "./src/js/index.js",
  },
  stats: {
    loggingDebug: ["sass-loader"],
  },
  output: {
    filename: "[name].min.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].min.css",
    }),
    new PurgeCSSPlugin({
      paths: glob.sync(
        [
          `${PATHS.js}/**/*.js`,
          `${PATHS.views}/**/*.twig`,
          `${PATHS.root}/*.php`,
        ],
        { nodir: true }
      ),

      safelist: {
        standard: [...purgecssWordpress.safelist, /aria/, /data/],
        deep: [/aria/, /data/, /^.*\[/],
        greedy: [/aria/, /data/, /^.*\[/],
      },
    }),
  ],
  // optimization: {
  //   // minimize: false,
  //   minimizer: [
  //     new TerserPlugin({
  //       terserOptions: {
  //         output: {
  //           comments: false,
  //         },
  //       },
  //       extractComments: false,
  //     }),
  //   ],
  // },

  module: {
    rules: [
      // {
      //   test: /\.m?js$/,
      //   exclude: /node_modules/,
      //   use: {
      //     loader: "babel-loader",
      //     options: {
      //       presets: ["@babel/preset-env"],
      //     },
      //   },
      // },
      {
        test: /\.scss$/i,
        use: [
          MiniCssExtractPlugin.loader, // 3. extract css into files
          "css-loader", // 2. Turns css into commonjs

          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  [
                    "postcss-preset-env",
                    {
                      stage: 3,
                      features: {
                        "nesting-rules": true,
                        clamp: true,
                        "custom-properties": false,
                      },
                    },
                  ],
                  ["postcss-sort-media-queries"],
                ],
              },
            },
          },

          "sass-loader", // 1. Turns sass into css
        ],
      },
      // {
      //   test: /\.m?js$/,
      //   exclude: /node_modules/,
      //   use: {
      //     loader: 'babel-loader',
      //     options: {
      //       presets: ['@babel/preset-env'],
      //     },
      //   },
      // },
    ],
  },
};
