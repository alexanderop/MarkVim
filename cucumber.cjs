module.exports = {
  default: {
    loader: ['ts-node/esm'],
    import: ['features/**/*.ts'],
    paths: ['features/**/*.feature'],
    format: ['progress-bar', 'html:cucumber-report.html'],
    parallel: 1, // Playwright tests are often best run sequentially per worker
    timeout: 30000, // 30 seconds timeout for each step
    worldParameters: {
      headless: true,
    },
  },
  headed: {
    loader: ['ts-node/esm'],
    import: ['features/**/*.ts'],
    paths: ['features/**/*.feature'],
    format: ['progress-bar', 'html:cucumber-report.html'],
    parallel: 1,
    timeout: 30000, // 30 seconds timeout for each step
    worldParameters: {
      headless: false,
    },
  },
}
