const Promise = require('bluebird')
const { responseError, responseSuccess, postToPayPal, getOrderTable, strToJSON, calTax, calShipping, constructShopifyBody, postToShopify, putToShopify } = require('../helpers/utils')
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
    let total_amount = 0.0
    const shopifyURL = 'https://city-cosmetics.myshopify.com/admin/orders.json'
    let shopifyBody = {}   
    let shopifyOrderId = "" 
    let shopifyOrderName = ""
    const checkout_id = req.body.checkoutid
    const click_id = req.body.clickid
    const productVariantId = req.body.productVariantId
    const quantity = String(req.body.quantity)
    const discount_amt = String(req.body.discount_amt)
    const product_title = req.body.product_title
    pBody.METHOD = 'GetExpressCheckoutDetails'
    pBody.TOKEN = req.body.paymentToken
    pBody.PAYERID = req.body.payerID
    postToPayPal(pBody)
    .then(data => { 
        payload = strToJSON(data)
        shipping_rate = calShipping(payload.COUNTRYCODE,payload.AMT)
        tax_rate = calTax(payload.SHIPTOSTATE)
        tax_amount = parseFloat(payload.AMT) * tax_rate
        total_amount = parseFloat(payload.AMT) + tax_amount + shipping_rate
        //for db storing
        payload.shipping_rate = shipping_rate.toFixed(2)
        payload.tax_amount = tax_amount.toFixed(2)
        payload.tax_rate = tax_rate.toFixed(2)
        payload.total_amount = total_amount.toFixed(2)


        //for db storing
        payload.customer = {
            "first_name": payload.FIRSTNAME,
            "last_name": payload.LASTNAME,
            "email": payload.EMAIL
        }
    
        payload.product = {
            "variant_id": productVariantId,
            "quantity": quantity,
            "discount_amount": discount_amt
        }

        payload.shipping_address = {
            "first_name": payload.FIRSTNAME,
            "last_name": payload.LASTNAME,
            "company": payload.BUSINESS,
            "address1": payload.PAYMENTREQUEST_0_SHIPTOSTREET,
            "address2": payload.PAYMENTREQUEST_0_SHIPTOSTREET2,
            "province": payload.PAYMENTREQUEST_0_SHIPTOSTATE,
            "city": payload.PAYMENTREQUEST_0_SHIPTOCITY,
            "phone": payload.PAYMENTREQUEST_0_SHIPTOPHONENUM,
            "zip": payload.PAYMENTREQUEST_0_SHIPTOZIP,
            "country": payload.PAYMENTREQUEST_0_SHIPTOCOUNTRYCODE
        }
        payload.billing_address = payload.shipping_address

        let line_items = []
        let tax_lines = []
        let note_attributes = []

        line_items.push({"variant_id": productVariantId, "quantity": quantity})
        tax_lines.push({"price": tax_amount, "rate": tax_rate, "title": "State tax"})
        note_attributes.push({"name":"gateway","value":"PayPal"})

        shopifyBody = constructShopifyBody(line_items,payload.AMT,payload.customer,payload.shipping_address,payload.billing_address,"parent order",note_attributes,tax_lines,payload.customer.email,payload.shipping_rate,discount_amt,"authorization","pending")

        console.log("Create order to Shopify")            
        return postToShopify(shopifyURL,shopifyBody)
    }).then(data => {
        shopifyOrderId = data.order.id
        shopifyOrderName = data.order.name

        let nBody = {}
        nBody.METHOD = 'DoExpressCheckoutPayment'
        nBody.TOKEN = payload.TOKEN
        nBody.PAYERID = payload.PAYERID
        nBody.PAYMENTREQUEST_0_PAYMENTACTION = 'Sale'
        nBody.PAYMENTREQUEST_0_DESC = product_title
        nBody.PAYMENTREQUEST_0_ITEMAMT = payload.AMT
        nBody.PAYMENTREQUEST_0_SHIPPINGAMT = shipping_rate.toFixed(2)
        nBody.PAYMENTREQUEST_0_TAXAMT = tax_amount.toFixed(2)
        nBody.PAYMENTREQUEST_0_AMT = total_amount.toFixed(2)
        nBody.PAYMENTREQUEST_0_CURRENCYCODE = 'USD'
        console.log("Transaction sent to Paypal")
        return postToPayPal(nBody) 

    }).then(data => {
        payload2 = strToJSON(data)
        payload2.tax_rate = payload.tax_rate

        if (payload2.ACK == "Success" || payload2.ACK == "SuccessWithWarning") {
            
            let transaction_body = {
                "transaction": {
                    "kind": "capture",
                    "status": "success",
                    "amount": total_amount
                }                  
            }
            const transaction_url = `https://city-cosmetics.myshopify.com/admin/orders/${shopifyOrderId}/transactions.json`
            console.log("Update order status to shopify")
            return postToShopify(transaction_url, transaction_body)

            .then(data => {
                let tags = payload2.PAYMENTINFO_0_TRANSACTIONID

                let order_body = {
                    "order": {
                        "id": shopifyOrderId,
                        "metafields": [
                        {
                            "key": "transaction_id",
                            "value": tags,
                            "value_type": "string",
                            "namespace": "global"
                        }
                        ]
                    }
                }
                const order_url = `https://city-cosmetics.myshopify.com/admin/orders/${shopifyOrderId}.json`;
                console.log("Put transaction id to shopify")
                return putToShopify(order_url, order_body)

                .then(data => {
                    console.log("save to DB")
                    return getOrderTable().put(checkout_id,payload.total_amount,click_id,payload.customer,payload.shipping_address,payload.billing_address,payload.product,payload.tax_rate,payload.tax_amount,payload.shipping_rate,tags,"PayPal","parent order",payload.shopify_order_id,payload.shopify_order_name)
                })
            })
        }
        else {
            console.log(payload2.L_LONGMESSAGE0)
            // return responseError(res,payload2)
            const delete_url = `https://city-cosmetics.myshopify.com/admin/orders/${shopifyOrderId}.json`
            console.log("Delete order to shopify")
            return deleteToShopify(delete_url)
        }
    })
    .then(data => responseSuccess(res, payload2))
    .catch(err => responseError(res, err))
  }
}];
