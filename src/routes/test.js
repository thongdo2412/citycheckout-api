const Promise = require('bluebird')
const { responseError, responseSuccess, postToPayPal, strToJSON } = require('../helpers/utils')
const map = require('../resources/funnel_maps/funnel_map')
module.exports = [{
  path: '/api/test',
  method: 'get',
  handler: (req, res) => {
    console.log("test")
    let pBody = {}
    pBody.VERSION = '204'
    pBody.METHOD = 'GetExpressCheckoutDetails'
    pBody.TOKEN = 'EC-2BR21754KW292341H'
    // pBody.METHOD = 'DoReferenceTransaction'    
    // pBody.PAYMENTACTION = 'Sale'
    // pBody.AMT = '81.75'
    // pBody.PAYMENTREQUEST_0_CURRENCYCODE = 'USD'
    // pBody.REFERENCEID = 'B-9JW242425E431145B'

    postToPayPal(pBody)
    .then(data => { 
      result = strToJSON(data)
      responseSuccess(res,result)
    })
    .catch(err => responseError(res, err))
  }
}];
