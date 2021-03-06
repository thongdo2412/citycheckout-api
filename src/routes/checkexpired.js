const Promise = require('bluebird')
const _ = require('lodash')
const { responseError, responseSuccess, getOrderTable, constructShopifyBody, postToShopify } = require('../helpers/utils');
module.exports = [{
  path: '/api/checkexpired',
  method: 'post',
  handler: (req, res) => {
    console.log("checkexpired endpoint...")
    getOrderTable().query(req.body.checkout_id)
    .then(data => {
      console.log(data) 
      if (data.Count == 0 && data.ScannedCount != 0)
        return responseSuccess(res, {"expired": "true"})
      else 
        return responseSuccess(res, {"expired": "false"})
    })
    .catch(err => responseError(res, err))
  }
}];
