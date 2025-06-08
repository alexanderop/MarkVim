module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['features/**/*.ts'],
    paths: ['features/**/*.feature'],
    format: ['progress-bar', 'html:cucumber-report.html'],
    parallel: 1, // Playwright tests are often best run sequentially per worker
  },
};