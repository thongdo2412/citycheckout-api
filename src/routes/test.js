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
    // const params = {
    //   "order_id": 140808028166,
    //   "refund_amount": 1
    // }
    // let gateway = ""
    // let trans_id = ""
    // const url = `https://city-cosmetics.myshopify.com/admin/orders/${params.order_id}.json`
    // const refund_amount = params.refund_amount
    // getFrShopify(url)
    // .then(data => {
    //   gateway = data.order.note_attributes[0].value
    //   console.log(gateway)
    //   console.log(data)
    //   metafield_url = `https://city-cosmetics.myshopify.com/admin/orders/${params.order_id}/metafields.json`
    //   return getFrShopify(metafield_url)
    // })
    // let payload = {}
    // let pBody = {}
   
    // pBody.METHOD = 'SetExpressCheckout'
    // pBody.PAYMENTREQUEST_0_PAYMENTACTION = 'Sale'
    // pBody.PAYMENTREQUEST_0_AMT = "81.75"
    // pBody.PAYMENTREQUEST_0_CURRENCYCODE = 'USD'
    // pBody.RETURNURL = "https://citybeauty.com"
    // pBody.CANCELURL = "https://citybeauty.com"
    // pBody.DESC = 'Funnel_Sale'
    // // pBody.METHOD = 'GetExpressCheckoutDetails'
    // // pBody.TOKEN = 'B-3DH20912051063532'
    // postToPayPal(pBody)
    // .then(data => {
    //   payload = strToJSON(data)
    //   let nBody = {}
    //   nBody.PAYERID = 'A9PKJ7YY24S3G'
    //   nBody.TOKEN = payload.TOKEN
    //   nBody.METHOD = 'GetExpressCheckoutDetails'
    //   return postToPayPal(nBody)
    // })
    getOrderTable().queryAll('4f1ff1k1pbdz1i1c2855')
    .then(data => {
      // payload = strToJSON(data)
      let customer = {}
      let shipping_address = {}
      let billing_address = {}
      data.Items.map((item) => {
        if (item.order_type == "parent") {
          customer = item.customer
          shipping_address = item.shipping_address
          billing_address = item.billing_address
        }
      })
      let payload = {}
      payload.customer = customer
      payload.shipping_address = billing_address
      payload.billing_address = billing_address
      responseSuccess(res,payload)
    })
    .catch(err => {
      console.log(err)
      responseError(res, err)
    })
  }
}];
