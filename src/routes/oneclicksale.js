const { responseError, responseSuccess, postToExtAPI, sign, postToPayPal, strToJSON, getOrderTable } = require('../helpers/utils');
module.exports = [{
  path: '/api/oneclicksale',
  method: 'post',
  handler: (req, res) => {
    const params = req.body
    if (params.gateway == 'cs') {
      const CS_URL = 'https://secureacceptance.cybersource.com/silent/pay'
      let CS_body = {}
      const signedDataFields = params.signed_field_names.split(',')
      signedDataFields.map(item=>{
          CS_body[item] = params[item]
      })
      CS_body['signature'] = sign(params)
      postToExtAPI(CS_URL,{},CS_body,"form")
      .then(data => {
        let response = {}
        response.gateway = 'cs'
        responseSuccess(res, response)
      })
      .catch((err) => {
        const body = { error_message: `Problem in creating transactions. ${err.display_message}` };
        responseError(res, body);
      })
    }
    else if (params.gateway == 'pp') {
      let pBody = {}
      let payload = {}
      let item_amount = 0.0
      pBody.METHOD = 'DoReferenceTransaction'
      pBody.PAYMENTACTION = 'Sale'
      pBody.CURRENCYCODE = 'USD'
      pBody.REFERENCEID = params.payment_token
      pBody.AMT = params.amount
      pBody.TAXAMT = params.tax_amount
      item_amount = parseFloat(params.amount) - parseFloat(params.tax_amount)
      pBody.ITEMAMT = item_amount.toFixed(2)
      postToPayPal(pBody)
      .then(data => {
        payload = strToJSON(data)
        return getOrderTable().queryAll(params.merchant_defined_data5)
      })
      .then(data => {
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
        const product = {
          "variant_id": params.merchant_defined_data7,
          "quantity": params.merchant_defined_data12,
          "discount_amount": params.merchant_defined_data13
        }
        return getOrderTable().put(params.merchant_defined_data5,payload.AMT,'',customer,shipping_address,billing_address,product,params.merchant_defined_data11,params.tax_amount,params.merchant_defined_data8,payload.TRANSACTIONID,'PP','child')
      })
      .then(data => {
        payload.gateway = 'pp'
        responseSuccess(res, payload)
      })
      .catch((err) => {
        const body = { error_message: `Problem in creating transactions. ${err.display_message}` };
        responseError(res, body);
      })
    }
  }
}];
