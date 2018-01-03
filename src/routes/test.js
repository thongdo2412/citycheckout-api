const Promise = require('bluebird')
const { responseError, responseSuccess, postToPayPal, strToJSON } = require('../helpers/utils')
const map = require('../resources/funnel_maps/funnel_map')
module.exports = [{
  path: '/api/test',
  method: 'get',
  handler: (req, res) => {
    console.log("test")
    let pBody = {}
    pBody.METHOD = 'RefundTransaction'
    pBody.TRANSACTIONID = '29T25119MG5447739'
    // pBody.METHOD = 'DoReferenceTransaction'    
    // pBody.PAYMENTACTION = 'Sale'
    // pBody.AMT = '81.75'
    // pBody.ITEMAMT = '75.00'
    // pBody.TAXAMT = '6.75'
    // pBody.PAYMENTREQUEST_0_CURRENCYCODE = 'USD'
    // pBody.REFERENCEID = 'B-00L757502E4039806'

    postToPayPal(pBody)
    .then(data => { 
      result = strToJSON(data)
      responseSuccess(res,result)
    })
    .catch(err => responseError(res, err))
  }
}];
