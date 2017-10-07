const Promise = require('bluebird');
const moment = require('moment');
const { responseError, responseSuccess, getOrderTable, getPlaid, getBrainTreeAuth } = require('../helpers/utils');
module.exports = [{
  path: '/api/test',
  method: 'get',
  handler: (req, res) => {
    // data = moment().format('YYYY-MM-DDTHH:mm:ss:SSS');
    const amount = 10.00
    const token = "g3vshy"
    // getOrderTable().scan('sent',false)
    getOrderTable().updateSentField( "test1@example.com", "2017-10-07T00:04:28:439")
    .then(data  => responseSuccess(res, data))
    // .then(data => {
    //   const gateway = getBrainTreeAuth();
    //   gateway.transaction.sale({
    //       amount: amount,
    //       paymentMethodToken: token,
    //       options: {
    //         submitForSettlement: true,
    //       }
    //     })
    //   .then(data => responseSuccess(res, data))
    // })
    .catch(err => responseError(res, err));
  }
}];
