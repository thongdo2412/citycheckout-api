const Promise = require('bluebird')
const _ = require('lodash')
const { responseError, responseSuccess,getOrderTable, postToThirdParties, constructShopifyBody, postToShopify, calculateTax, getBrainTreeAuth } = require('../helpers/utils');
module.exports = [{
  path: '/api/test',
  method: 'get',
  handler: (req, res) => {
    getOrderTable().updateSentField('7f1fco1815bi2h2n1h128','2017-12-05T02:33:41:523')
    .then(data => responseSuccess(res,data))
  }
}];
