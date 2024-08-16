const path = require('node:path');
const common = require('./webpack.common');
const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const glob = require('glob');
const { PurgeCSSPlugin } = require('purgecss-webpack-plugin');

// for images folder structure - inspired by wordpress
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

module.exports = merge(common, {
  mode: 'production',
  devtool: false,
  output: {
    filename: '[name][contenthash].min.js',
    // hashDigestLength: 6,
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name][contenthash].min.css',
    }),

    new PurgeCSSPlugin({
      paths: glob.sync(`./src/**/*`, { nodir: true }),
      safelist: {
        standard: [/aria/, /data/],
        deep: [/aria/, /data/, /^.*\[/],
        greedy: [/aria/, /data/, /^.*\[/],
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.scss$/i,
        use: [
          MiniCssExtractPlugin.loader, // 3. extract css into files
          {
            loader: 'css-loader',
            options: {},
          }, // 2. Turns css into commonjs
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  [
                    'postcss-preset-env',
                    {
                      stage: 3,
                      features: {
                        'nesting-rules': true,
                        clamp: true,
                        'custom-properties': false,
                      },
                    },
                  ],
                  ['postcss-sort-media-queries'],
                ],
              },
            },
          },

          'sass-loader', // 1. Turns sass into css
        ],
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },

      {
        test: /\.(png|jpe?g)$/i,
        type: 'asset/resource',

        generator: {
          filename: `images/${currentYear}/${currentMonth}/[name][ext]`, // Output path and filename pattern
        },
      },
      {
        test: /\.(ttf|woff2|woff)$/i,
        type: 'asset/resource',

        generator: {
          filename: 'font/[name][ext]', // Output path and filename pattern
        },
      },
    ],
  },

  optimization: {
    // minimize: false,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false,
          },
        },
        extractComments: false,
      }),
      new ImageMinimizerPlugin({
        generator: [
          {
            // You can apply generator using `?as=webp`, you can use any name and provide more options
            preset: 'webp',
            implementation: ImageMinimizerPlugin.sharpGenerate,
            options: {
              encodeOptions: {
                // Please specify only one codec here, multiple codecs will not work
                webp: {
                  quality: 70,
                },
              },
            },
          },
          {
            // You can apply generator using `?as=webp`, you can use any name and provide more options
            preset: 'avif',
            implementation: ImageMinimizerPlugin.sharpGenerate,
            options: {
              encodeOptions: {
                // Please specify only one codec here, multiple codecs will not work
                avif: {
                  quality: 70,
                },
              },
            },
          },
        ],
      }),
    ],
  },
});
