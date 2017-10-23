const plaid = require('plaid');
const KMS = require('aws-sdk/clients/kms');
const { DynamoTable } = require('../helpers/dynamo');
const braintree = require('braintree');
const kms = new KMS();
const httpReq = require('request-promise')
const Promise = require('bluebird')
const config = require('../config')

function responseSuccess(res, body = {}, statusCode = 200) {
  return res.status(statusCode).json(body);
}

function responseError(res, body, statusCode = 400) {
  return responseSuccess(res, body, statusCode);
}

function getOrderTable() {
  return new DynamoTable();
}

function getBrainTreeAuth() {
  return braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BT_MERCHANT_ID,
    publicKey: process.env.BT_PUBLIC_KEY,
    privateKey: process.env.BT_PRIVATE_KEY
  });
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

function constructShopifyBody (line_items, amount, customer, shipping, tax_lines, customerEmail, shipAmount) {
  let shippinglines = []
  if (shipAmount > 0) {
      shippinglines.push({
          "title": "Standard Shipping (3-5 Business Days)",
          "price": "4.95",
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
          "tax_lines": tax_lines,
          "email": customerEmail,
          "total_price": amount,
          "total_tax": tax_lines[0].price,
          "currency": "USD"
        }
  }
  return shopifyBody
}

function calculateTax(chtx,totalAmount,shipAmount){
  if (chtx > 0 ) {
    priceWTax = totalAmount - shipAmount
    priceWOTax = (priceWTax / (1 + chtx)).toFixed(2)
    totalTax = (priceWOTax * chtx).toFixed(2)
    return  { "price": totalTax, "rate": chtx, "title": "State tax" }
  }
  else {
    return { "price": 0, "rate": 0, "title": "State tax"}
  }
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

module.exports = {
  responseSuccess,
  responseError,
  getBrainTreeAuth,
  getOrderTable,
  postToThirdParties,
  constructShopifyBody,
  calculateTax,
};
