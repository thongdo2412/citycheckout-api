const Promise = require('bluebird')
const moment = require('moment')
const _ = require('lodash')
const { responseError, responseSuccess, getShopAPILimit, getFrShopify } = require('../helpers/utils')
const map = require('../resources/funnel_maps/funnel_map')
module.exports = [{
  path: '/api/test',
  method: 'get',
  handler: (req, res) => {
   console.log("test endpoint")
   getShopAPILimit()
   .then(data => {
    let call_limit = data.headers.http_x_shopify_shop_api_call_limit.split("/")
    let used_credit = parseInt(call_limit[0])
    console.log(`used credit: ${used_credit}`)
    if (used_credit >= 220){
      setTimeout(function(){
        return getShopAPILimit()
      }, 10000)
    }
    else {
      return getShopAPILimit()
    }
  })
  .then(data=> responseSuccess(res,data))
  .catch(err => responseError(res,err))


  }
}];
