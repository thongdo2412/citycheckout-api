const { responseError, responseSuccess, postToExtAPI, sign, postToPayPal, strToJSON, getOrderTable, constructShopifyBody, postToShopify, putToShopify } = require('../helpers/utils');
module.exports = [{
  path: '/api/oneclicksale',
  method: 'post',
  handler: (req, res) => {
    const params = req.body
    if (params.gateway == 'cs') {
      console.log("Upsell transaction in Cybersource endpoint...")
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
      console.log("Upsell transaction in Paypal endpoint...")      
      let pBody = {}
      let payload = {}
      let customer = {}
      let shipping_address = {}
      let billing_address = {}
      let item_amount = 0.0
      pBody.METHOD = 'DoReferenceTransaction'
      pBody.DESC = params.product_title
      pBody.PAYMENTACTION = 'Sale'
      pBody.CURRENCYCODE = 'USD'
      pBody.REFERENCEID = params.payment_token
      pBody.AMT = params.amount
      pBody.TAXAMT = params.tax_amount
      item_amount = parseFloat(params.amount) - parseFloat(params.tax_amount)
      pBody.ITEMAMT = item_amount.toFixed(2)
      console.log("Transaction sent to Paypal")
      postToPayPal(pBody)
      .then(data => {
        payload = strToJSON(data)
        if (payload.ACK == "Success" || payload.ACK == "SuccessWithWarning") {
          return getOrderTable().queryAll(params.merchant_defined_data5)
          .then(data => {
            data.Items.map((item) => {
              if (item.order_type == "parent order") {
                customer = item.customer
                shipping_address = item.shipping_address
                billing_address = item.billing_address
              }
            })
            payload.product = {
              "variant_id": params.merchant_defined_data7,
              "quantity": params.merchant_defined_data12,
              "discount_amount": params.merchant_defined_data13
            }

            let tags = payload.TRANSACTIONID
            let line_items = []
            let tax_lines = []
            let note_attributes = []
            let shopifyBody = {}
            let variant_arr = []
            const shopifyURL = 'https://city-cosmetics.myshopify.com/admin/orders.json'

            variant_arr = params.merchant_defined_data7.split(",") // for color combo orders
            if (variant_arr.length > 1) {
              variant_arr.map(variant => {
                line_items.push({"variant_id": variant, "quantity": params.merchant_defined_data12})
              })
            }
            else {
              line_items.push({"variant_id": params.merchant_defined_data7, "quantity": params.merchant_defined_data12})
            }
            tax_lines.push({"price": params.tax_amount, "rate": params.merchant_defined_data11, "title": "State tax"})
            note_attributes.push({"name":"gateway","value":"PayPal"})
            shopifyBody = constructShopifyBody(line_items,payload.AMT,customer,shipping_address,billing_address,tags,"upsell order",note_attributes,tax_lines,customer.email,params.merchant_defined_data8,params.merchant_defined_data13)
            console.log("Create order to Shopify")
            return postToShopify(shopifyURL,shopifyBody)
          })
          .then(data => {
            payload.shopify_order_id = data.order.id
            payload.shopify_order_name = data.order.name
            let order_body = {
              "order": {
                "id": data.order.id,
                "metafields": [
                  {
                    "key": "transaction_id",
                    "value": data.order.tags,
                    "value_type": "string",
                    "namespace": "global"
                  }
                ]
              }
            }
            const order_url = `https://city-cosmetics.myshopify.com/admin/orders/${data.order.id}.json`;
            return putToShopify(order_url, order_body)
          })
          .then (data => {
            return getOrderTable().put(params.merchant_defined_data5,payload.AMT,"",customer,shipping_address,billing_address,payload.product,params.merchant_defined_data11,params.tax_amount,params.merchant_defined_data8,payload.TRANSACTIONID,"PayPal","upsell order",payload.shopify_order_id,payload.shopify_order_name)
          })
        }
        else {
          console.log(payload.L_LONGMESSAGE0)
          return responseError(res,payload)
        }
      })
      .then(data => {
        responseSuccess(res, payload)
      })
      .catch((err) => {
        const body = { error_message: `Problem in creating transactions. ${err.display_message}` };
        responseError(res, body);
      })
    }
  }
}];
