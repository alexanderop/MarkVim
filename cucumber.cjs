const process = require('node:process')

module.exports = {
  default: {
    paths: ['tests/features/**/*.feature'],
    import: [
      'tests/support/**/*.ts',
      'tests/steps/**/*.ts',
    ],
    format: [
      'progress',
      'json:reports/cucumber_report.json',
      'html:reports/cucumber_report.html',
    ],
    formatOptions: {
      snippetInterface: 'async-await',
    },
    // Reduce parallelism in CI to avoid resource contention
    parallel: process.env.CI === 'true' ? 1 : 2,
    timeout: 15000,
  },
}
