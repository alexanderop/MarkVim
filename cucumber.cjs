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
    parallel: 2,
    timeout: 15000,
  },
}
