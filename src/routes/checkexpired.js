const Promise = require('bluebird')
const _ = require('lodash')
const { responseError, responseSuccess,getOrderTable, postToThirdParties, constructShopifyBody, postToShopify, calculateTax, getBrainTreeAuth } = require('../helpers/utils');
module.exports = [{
  path: '/api/checkexpired',
  method: 'post',
  handler: (req, res) => {
    getOrderTable().query(req.body.checkout_id)
    .then(data => { 
      if (data.Count == 0)
        return responseSuccess(res, {"expired": "true"})
      else 
        return responseSuccess(res, {"expired": "false"})
    })
    .catch(err => responseError(res, err))
  }
}];
