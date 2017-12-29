const Promise = require('bluebird')
const { responseError, responseSuccess, postToPayPal, getOrderTable, strToJSON, calTax, calShipping } = require('../helpers/utils')
const map = require('../resources/funnel_maps/funnel_map')
module.exports = [{
  path: '/api/pexecbill',
  method: 'post',
  handler: (req, res) => {
    let payload = {}
    let payload2 = {}
    let pBody = {}
    let tax_rate = 0.0
    let tax_amount = 0.0
    let shipping_rate = 0.0
    const checkout_id = req.body.checkoutid
    const click_id = req.body.clickid
    const productVariantId = req.body.productVariantId
    pBody.METHOD = 'GetExpressCheckoutDetails'
    pBody.TOKEN = req.body.paymentToken
    pBody.PAYERID = req.body.payerID
    postToPayPal(pBody)
    .then(data => { 
        result = strToJSON(data)
        payload = result
        shipping_rate = calShipping(result.COUNTRYCODE,result.AMT)
        tax_rate = calTax(result.SHIPTOSTATE)
        tax_amount = parseFloat(result.AMT) * tax_rate
        total_amount = parseFloat(result.AMT) + tax_amount + shipping_rate
        //for db storing
        payload.SHIPPINGAMT = shipping_rate.toFixed(2)
        payload.TAXAMT = tax_amount.toFixed(2)
        payload.tax_rate = tax_rate.toFixed(2)
        payload.total_amount = total_amount.toFixed(2)

        let nBody = {}
        nBody.METHOD = 'DoExpressCheckoutPayment'
        nBody.TOKEN = result.TOKEN
        nBody.PAYERID = result.PAYERID
        nBody.PAYMENTREQUEST_0_PAYMENTACTION = 'Sale'
        nBody.PAYMENTREQUEST_0_ITEMAMT = result.AMT
        nBody.PAYMENTREQUEST_0_SHIPPINGAMT = shipping_rate.toFixed(2)
        nBody.PAYMENTREQUEST_0_TAXAMT = tax_amount.toFixed(2)
        nBody.PAYMENTREQUEST_0_AMT = total_amount.toFixed(2)
        nBody.PAYMENTREQUEST_0_CURRENCYCODE = 'USD'
        return postToPayPal(nBody)  
    })
    .then(data => {
        result = strToJSON(data)
        payload2 = result
        payload2.tax_rate = payload.tax_rate
        const customer = {
            "first_name": payload.FIRSTNAME,
            "last_name": payload.LASTNAME,
            "email": payload.EMAIL
        }
    
        const product = {
        "variant_id": productVariantId
        }

        const shipping_address = {
            "first_name": payload.FIRSTNAME,
            "last_name": payload.LASTNAME,
            "company": "",
            "address1": payload.PAYMENTREQUEST_0_SHIPTOSTREET,
            "address2": payload.PAYMENTREQUEST_0_SHIPTOSTREET2,
            "province": payload.PAYMENTREQUEST_0_SHIPTOSTATE,
            "city": payload.PAYMENTREQUEST_0_SHIPTOCITY,
            "phone": payload.PAYMENTREQUEST_0_SHIPTOPHONENUM,
            "zip": payload.PAYMENTREQUEST_0_SHIPTOZIP,
            "country": payload.PAYMENTREQUEST_0_SHIPTOCOUNTRYCODE
        }
        const billing_address = shipping_address  
        return getOrderTable().put(checkout_id,result.PAYMENTINFO_0_AMT,click_id,customer,shipping_address,billing_address,product,payload.tax_rate,payload.TAXAMT,payload.SHIPPINGAMT,result.PAYMENTINFO_0_TRANSACTIONID,"PP")
    })
    .then(data => responseSuccess(res, payload2))
    .catch(err => responseError(res, err))
  }
}];
