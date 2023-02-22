const esbuildPluginTsc = require('esbuild-plugin-tsc');
const { copy } = require('esbuild-plugin-copy');

module.exports = [
  esbuildPluginTsc(),
  copy({ assets: { from: './node_modules/koa2-swagger-ui/dist/*.hbs', to: './' } }),
];
