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
  }
}
