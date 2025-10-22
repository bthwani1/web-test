module.exports = {
  defaults: {
    standard: 'WCAG2AA',
    timeout: 30000,
    wait: 2000,
    chromeLaunchConfig: {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  },
  urls: [
    {
      url: 'http://localhost:3000',
      actions: [
        'wait for element #main-content to be visible',
        'check accessibility'
      ]
    },
    {
      url: 'http://localhost:3000/admin',
      actions: [
        'wait for element .admin-panel to be visible',
        'check accessibility'
      ]
    },
    {
      url: 'http://localhost:3000/products',
      actions: [
        'wait for element .products-grid to be visible',
        'check accessibility'
      ]
    }
  ]
};