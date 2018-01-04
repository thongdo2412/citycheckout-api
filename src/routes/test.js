const Promise = require('bluebird')
const { responseError, responseSuccess, postToPayPal, strToJSON, getOrderTable } = require('../helpers/utils')
const map = require('../resources/funnel_maps/funnel_map')
module.exports = [{
  path: '/api/test',
  method: 'get',
  handler: (req, res) => {
    console.log("test")
    let pBody = {}
    pBody.METHOD = 'RefundTransaction'
    pBody.TRANSACTIONID = '5436983409078152L'
    // pBody.METHOD = 'DoReferenceTransaction'    
    // pBody.PAYMENTACTION = 'Sale'
    // pBody.AMT = '81.75'
    // pBody.ITEMAMT = '75.00'
    // pBody.TAXAMT = '6.75'
    // pBody.PAYMENTREQUEST_0_CURRENCYCODE = 'USD'
    // pBody.REFERENCEID = 'B-00L757502E4039806'

    // let pBody = {}
    // pBody.METHOD = 'SetExpressCheckout'
    // pBody.RETURNURL = "https://google.com"
    // pBody.CANCELURL = "https://google.com"
    // pBody.PAYMENTREQUEST_0_PAYMENTACTION = 'Sale'
    // pBody.PAYMENTREQUEST_0_AMT = "10.00"
    // pBody.PAYMENTREQUEST_0_CURRENCYCODE = 'USD'
    // pBody.DESC = 'Funnel_Sale'
    // pBody.L_BILLINGTYPE0 = 'MerchantInitiatedBilling'

    postToPayPal(pBody)
    .then(data => { 
      result = strToJSON(data)
      responseSuccess(res,result)
    })

    // getOrderTable().query("8f1ff1e051m2by191hx3")
    // .then(data => {
    //   console.log(data)
    //   responseSuccess(res, data)
    // })
    .catch(err => responseError(res, err))
  }
}];
