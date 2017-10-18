const AWS = require('aws-sdk')
AWS.config.setPromisesDependency(require('bluebird'))
const awsRegion = process.env.AWS_DEFAULT_REGION || 'us-east-1'
AWS.config.update({region: awsRegion})

module.exports = {
  AWS,
  db: {
    tables: {
      order: {
        name: process.env.ORDER_TABLE,
        partition: 'key',
        sort: 'date'
      }
    }
  },
  shopify: {
    name: process.env.SHOPIFY_NAME,
    apikey: process.env.SHOPIFY_API_KEY,
    password: process.env.SHOPIFY_PASSWORD,
    webhooks_secret: process.env.SHOPIFY_WH_SECRET
  },
}
