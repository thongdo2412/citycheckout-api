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
    const params = {
      "order_id": 140808028166,
      "refund_amount": 1
    }
    let gateway = ""
    let trans_id = ""
    const url = `https://city-cosmetics.myshopify.com/admin/orders/${params.order_id}.json`
    const refund_amount = params.refund_amount
    getFrShopify(url)
    .then(data => {
      gateway = data.order.note_attributes[0].value
      console.log(gateway)
      console.log(data)
      metafield_url = `https://city-cosmetics.myshopify.com/admin/orders/${params.order_id}/metafields.json`
      return getFrShopify(metafield_url)
    })
    .then(data => {
      responseSuccess(res,data)
    })
    .catch(err => {
      console.log(err)
      responseError(res, err)
    })
  }
}];
