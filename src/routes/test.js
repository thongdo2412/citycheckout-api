const Promise = require('bluebird')
const _ = require('lodash')
const { responseError, responseSuccess,getOrderTable, postToThirdParties, constructShopifyBody, postToShopify, calculateTax, getBrainTreeAuth } = require('../helpers/utils');
module.exports = [{
  path: '/api/test',
  method: 'get',
  handler: (req, res) => {
    // const gateway = getBrainTreeAuth()
    // function getStatus(refund)
    // {
    //   let trans_id = ""
    //   let promises = []
    //   promises = refund.map((item) => { // assuming properties attribute used to store BT, name :"BT_trans_id"
    //     trans_id = item.line_item.properties[0].value
    //     if (trans_id) {
    //       console.log("going into refund")
    //       console.log(typeof(trans_id))
    //       console.log(trans_id)
    //       return gateway.transaction.find(trans_id)
    //     }
    //   })
    //   return promises
    // }

    // const refund = [
    //   {
    //     "line_item":{
    //       "properties":[
    //         {
    //           "name": "BT_trans",
    //           "value": "2wcrs0yn"
    //         }
    //       ]
    //     }
    //   },
    //   {
    //     "line_item":{
    //       "properties":[
    //         {
    //           "name": "BT_trans",
    //           "value": "5pdh06hz"
    //         }
    //       ]
    //     }
    //   }
    // ]

    // Promise.all(getStatus(refund))
    // .then(data => {
    //   let promises = []
    //   promises = data.map((item) => {
    //     console.log(item.id)
    //     console.log(item.status)
    //     if (item.status == 'settled' || item.status == 'settling') {
    //       return gateway.transaction.refund(item.id)
    //     }
    //     else {
    //       return gateway.transaction.void(item.id)
    //     }
    //   })
    //   return responseSuccess(res,promises)
    // })
    // .catch(err => responseError(res, err))
    let payload = {}
    getOrderTable().scan()
    .then(data => responseSuccess(res, data))
    .catch(err => responseError(res, err))
  }
}];
