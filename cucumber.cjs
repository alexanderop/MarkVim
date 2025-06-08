module.exports = {
  default: {
    loader: ['ts-node/esm'],
    import: ['features/**/*.ts'],
    paths: ['features/**/*.feature'],
    format: ['progress-bar', 'html:cucumber-report.html', 'json:cucumber-results.json'],
    parallel: 1, // Playwright tests are often best run sequentially per worker
    timeout: 60000, // 60 seconds timeout for each step (increased for CI)
    worldParameters: {
      headless: true,
    },
  },
  headed: {
    loader: ['ts-node/esm'],
    import: ['features/**/*.ts'],
    paths: ['features/**/*.feature'],
    format: ['progress-bar', 'html:cucumber-report.html', 'json:cucumber-results.json'],
    parallel: 1,
    timeout: 60000, // 60 seconds timeout for each step (increased for CI)
    worldParameters: {
      headless: false,
    },
  },
}
