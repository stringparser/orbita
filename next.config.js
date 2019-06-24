const withLess = require('@zeit/next-less');
const withTypescript = require('@zeit/next-typescript');

exports = module.exports = withLess(
  withTypescript({
    cssModules: true,
    cssLoaderOptions: {
      importLoaders: 1,
      localIdentName: "[local]___[hash:base64:5]",
    }
  })
);
