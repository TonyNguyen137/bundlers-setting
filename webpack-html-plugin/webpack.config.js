const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const glob = require('glob');
const { PurgeCSSPlugin } = require('purgecss-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const PATHS = {
  src: path.join(__dirname, 'src'),
};

module.exports = (env) => {
  return {
    mode: env.mode,
    devtool: env.mode === 'production' ? false : 'source-map',
    stats: {
      loggingDebug: ['sass-loader'],
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      clean: true,
    },

    resolve: {
      alias: {
        '@scripts': path.join(__dirname, 'src', 'js'),
        '@styles': path.join(__dirname, 'src', 'scss'),
        '@images': path.join(__dirname, 'src', 'assets', 'images'),

        '@fonts': path.join(__dirname, 'src', 'assets', 'fonts'),
      },
    },

    plugins: [
      new HtmlBundlerPlugin({
        // path to templates
        entry: 'src/views/',
        entryFilter: (file) => {
          if (/includes/.test(file)) return false; // ignore files containing the `include` in the path
        },

        js: {
          // output filename for JS
          filename: 'static/[name].[contenthash:8].js',
        },
        css: {
          // output filename for CSS
          filename: 'static/[name].[contenthash:8].css',
        },
        exclude: [
          'src/include/header.html', // Adjust this path as per your file structure
        ],
        preprocessor: 'pug', // use Pug templating engine
      }),
      env.mode === 'production' &&
        new PurgeCSSPlugin({
          paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
          content: ['**/*.js', '**/*.html', '**/*.pug'],
          safelist: {
            standard: [/aria/, /data/, /:focus/],
            deep: [/aria/, /data/, /^.*\[/],
            greedy: [/aria/, /data/, /^.*\[/],
          },
        }),
    ],

    module: {
      rules: [
        {
          test: /\.(scss)$/,
          use: [
            'css-loader',
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
            ,
            'sass-loader',
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
          test: /\.(png|jp?g|webp)$/,
          type: 'asset',
          generator: {
            // save images to file
            filename: (ob) => {
              const params = new URLSearchParams(
                ob.module.resourceResolveData.query
              );

              // Get the value of the 'w' parameter
              const width = params.get('w');
              // console.log('WIDTH: ', width);

              if (width) {
                return `static/[name]-w${width}[ext]`;
              }
              return `static/[name][ext]`;
            },
          },

          parser: {
            dataUrlCondition: {
              // inline images < 2 KB
              maxSize: 2 * 1024,
            },
          },
        },

        {
          test: /\.(ico|svg)$/,
          type: 'asset/resource',
          generator: {
            filename: 'static/[name].[hash:8][ext][query]',
          },
        },

        {
          test: /\.(ttf|woff2|woff)/,
          type: 'asset',
          generator: {
            // save fonts to file
            filename: 'static/[name].[ext]',
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
          minimizer: {
            implementation: ImageMinimizerPlugin.sharpMinify,
          },
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
              // You can apply generator using `?as=avif`, you can use any name and provide more options
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

    // enable HMR with live reload
    devServer: {
      static: path.resolve(__dirname, 'dist'),
      watchFiles: {
        paths: ['src/**/*.*'],
        options: {
          usePolling: true,
        },
      },
    },
  };
};
