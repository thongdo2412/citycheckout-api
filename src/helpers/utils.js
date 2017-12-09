const KMS = require('aws-sdk/clients/kms');
const { DynamoTable } = require('../helpers/dynamo');
const kms = new KMS();
const httpReq = require('request-promise')
const Promise = require('bluebird')
const config = require('../config')
const cryptoJS = require('crypto-js')

function responseSuccess(res, body = {}, statusCode = 200) {
  return res.status(statusCode).json(body);
}

function responseError(res, body, statusCode = 400) {
  return responseSuccess(res, body, statusCode);
}

function getOrderTable() {
  return new DynamoTable();
}

function postToExtAPI (url,headers,body,contentType) {
  let options = {
    method: 'POST',
    uri: url,
    headers: headers,
  }

  if (contentType == "json") {
    options.body = body
    options.json = true
  }else if (contentType == "form") {
    options.form = body
  }
  return httpReq(options)
}

function constructShopifyBody (line_items, amount, customer, shipping, billing, tax_lines, customerEmail, ship_amount) {
  let shippinglines = []
  if (ship_amount > 0) {
      shippinglines.push({
          "title": "Standard Shipping (3-5 Business Days)",
          "price": `${ship_amount}`,
          "code": "CITY_FLAT",
          "source": "CITY_flat"
      })
    }
    else {
      shippinglines.push({
        "title": "Free Standard Shipping (3-5 Business Days)",
        "price": "0.00",
        "code": "CITY_FLAT",
        "source": "CITY_flat"
      })
    }
  shopifyBody = {
        "order": {
          "line_items": line_items,
          "transactions": [
            {
              "kind": "sale",
              "status": "success",
              "amount": amount
            }
          ],
          "shipping_lines": shippinglines,
          "customer": customer,
          "shipping_address": shipping,
          "billing_address": billing,
          "tax_lines": tax_lines,
          "email": customerEmail,
          "total_price": amount,
          "total_tax": tax_lines[0].price,
          "currency": "USD"
        }
  }
  return shopifyBody
}

function postToThirdParties(shopifyBody,cid,payout) {
  return Promise.all([postToShopify(shopifyBody), postToVoluum(cid,payout)])
}

function postToShopify(body) {
  const shopURL = "https://city-cosmetics.myshopify.com/admin/orders.json"
  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": config.shopify.password
  }
  return postToExtAPI(shopURL,headers,body,"json")
}

function postToVoluum(cid,payout) {
  const volURL = "https://vmhlw.voluumtrk2.com/postback"
  body = {
    "cid": cid,
    "payout": payout
  }
  return postToExtAPI(volURL,{},body,"form")
}
function sign (params) {
  return signData(buildDataToSign(params), config.Cybersource.SECRET_KEY)
}

function buildDataToSign(params) {
  let dataToSign = []
  const signedFieldNames = params.signed_field_names.split(',')
  signedFieldNames.map(item => {
      dataToSign.push(`${item}=${params[item]}`)
  })
  return dataToSign.join()
}

function signData(data,secret_key) {
  const hash = cryptoJS.HmacSHA256(data, secret_key)
  return cryptoJS.enc.Base64.stringify(hash)  
}

module.exports = {
  responseSuccess,
  responseError,
  getOrderTable,
  postToThirdParties,
  postToShopify,
  postToExtAPI,
  constructShopifyBody,
  sign,
};
