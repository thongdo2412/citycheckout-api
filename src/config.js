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
  citycheckout: {
    key: process.env.CITY_CHECKOUT_KEY
  },
  shopify: {
    name: process.env.SHOPIFY_NAME,
    apikey: process.env.SHOPIFY_API_KEY,
    password: process.env.SHOPIFY_PASSWORD,
    webhooks_secret: process.env.SHOPIFY_WH_SECRET
  },
  Cybersource: {
    TEST_SECRET_KEY: process.env.CS_SECRET,
    SECRET_KEY: process.env.CS_SECRET_KEY
  },
  Paypal: {
    client_id: process.env.PAYPAL_CLIENT_ID,
    secret: process.env.PAYPAL_SECRET,
    sandbox: process.env.PAYPAL_SANDBOX,
    production: process.env.PAYPAL_PRODUCTION,
    user: process.env.PAYPAL_USER,
    pwd: process.env.PAYPAL_PWD,
    signature: process.env.PAYPAL_SIGNATURE,
    sandbox_url: 'https://api-3t.sandbox.paypal.com/nvp',
    production_url: 'https://api-3t.paypal.com/nvp'
  },
  AMZ: {
    client_id: process.env.AMZ_CLIENT_ID,
    client_secret: process.env.AMZ_CLIENT_SECRET,
    merchant_id: process.env.AMZ_MERCHANT_ID,
    access_key: process.env.AMZ_ACCESS_KEY,
    secret_key: process.env.AMZ_SECRET_KEY
  }
}
