const Promise = require('bluebird')
const moment = require('moment')
const _ = require('lodash')
const { responseError, responseSuccess, postToPayPal, strToJSON, getOrderTable,postToShopify,getFrShopify,putToShopify,constructShopifyBody,postToVoluum } = require('../helpers/utils')
const map = require('../resources/funnel_maps/funnel_map')
module.exports = [{
  path: '/api/test',
  method: 'get',
  handler: (req, res) => {
    console.log("test")
    let pBody = {}
    pBody.METHOD = 'RefundTransaction'
    pBody.REFUNDTYPE = 'Partial'
    pBody.AMT = refund_amount
    pBody.TRANSACTIONID = trans_id
    return postToPayPal(pBody)
    .then(data => responseSuccess(res, data))
    .catch(err => {
      console.log(err)
      responseError(res, err)
    })
  }
}];
