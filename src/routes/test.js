const Promise = require('bluebird')
const _ = require('lodash')
const moment = require('moment')
const { responseError, responseSuccess, getFunnelMap } = require('../helpers/utils')
const map = require('../resources/funnel_maps/funnel_map')
module.exports = [{
  path: '/api/test',
  method: 'get',
  handler: (req, res) => {
    checkoutRoute = 0;
    body = map.funnelNShipping
    checkouts = body.checkouts
    shipping_rate = body.shipRate
    funnels = body.funnels

    // //checkout js
    // pagename = "cbl001"
    // let US_funnel = ""
    // checkouts.map(item => {
    //   if (item.pagename == pagename){
    //     console.log(item.title)
    //     console.log(item.product_id)
    //     console.log(item.price)
    //     US_funnel = item.US_funnel
    //   }
    // })
    // funnels.map(funnel => {
    //   if (funnel.id == US_funnel) {
    //     console.log(funnel.offers[0].pagename)
    //   }
    // })

    // upsell js
    

    return responseSuccess(res,{})
  }
}];
