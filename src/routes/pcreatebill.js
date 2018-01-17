const Promise = require('bluebird')
const { responseError, responseSuccess, postToPayPal, strToJSON } = require('../helpers/utils')
const map = require('../resources/funnel_maps/funnel_map')
module.exports = [{
  path: '/api/pcreatebill',
  method: 'post',
  handler: (req, res) => {
    let pBody = {}
    pBody.METHOD = 'SetExpressCheckout'
    pBody.RETURNURL = req.body.return_url
    pBody.CANCELURL = req.body.cancel_url
    pBody.PAYMENTREQUEST_0_PAYMENTACTION = 'Sale'
    pBody.PAYMENTREQUEST_0_DESC = req.body.product_title
    pBody.PAYMENTREQUEST_0_AMT = req.body.amount
    pBody.PAYMENTREQUEST_0_CURRENCYCODE = 'USD'
    pBody.DESC = 'Funnel_Sale'
    pBody.L_BILLINGTYPE0 = 'MerchantInitiatedBilling'

    postToPayPal(pBody)
    .then(data => { 
      result = strToJSON(data)
      responseSuccess(res,result)
    })
    .catch(err => responseError(res, err))
  }
}];
