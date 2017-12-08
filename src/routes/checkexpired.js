const Promise = require('bluebird')
const _ = require('lodash')
const { responseError, responseSuccess,getOrderTable, postToThirdParties, constructShopifyBody, postToShopify, calculateTax, getBrainTreeAuth } = require('../helpers/utils');
module.exports = [{
  path: '/api/checkexpired',
  method: 'post',
  handler: (req, res) => {
    req.body.checkout_id
    getOrderTable().query(req.body.checkout_id)
    .then(data => { 
      if (!data.sent_at)
        return responseSuccess(res, {"expired":"false"})
      else 
        return responseSuccess(res, {"expired":"true"})
    })
    .catch(err => responseError(res, err))
  }
}];
