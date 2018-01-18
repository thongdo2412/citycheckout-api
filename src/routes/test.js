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
    // // B-04504769AC0697338
    // let pBody = {}
    // pBody.METHOD = 'DoReferenceTransaction'
    // pBody.DESC = 'City Lips - 3 Tubes, Add-On Only Offer'
    // pBody.PAYMENTACTION = 'Sale'
    // pBody.CURRENCYCODE = 'USD'
    // pBody.REFERENCEID = 'B-04504769AC0697338'
    // pBody.AMT = '81.75'
    // pBody.TAXAMT = '6.75'
    // item_amount = 75.00
    // pBody.ITEMAMT = item_amount.toFixed(2)
    // postToPayPal(pBody)
    responseSuccess(res, {"test": "ok"})
    .catch(err => {
      console.log(err)
      responseError(res, err)
    })
  }
}];
