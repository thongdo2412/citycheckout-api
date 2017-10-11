const Promise = require('bluebird');
const moment = require('moment');
const { responseError, responseSuccess, getOrderTable, getBrainTreeAuth } = require('../helpers/utils');
module.exports = [{
  path: '/api/test',
  method: 'get',
  handler: (req, res) => {
    // data = moment().format('YYYY-MM-DDTHH:mm:ss:SSS');
    const amount = 10.00
    const token = "g3vshy"
    const product = {
      id: 44739029702,
      price: "35.00",
      sku: "CITYADVCLR-FULL-1x"
    }
    getOrderTable().put("test4@example.com",amount,"abcd12345",{},{},{},product)
    // getOrderTable().scan("sent",false)
    // getOrderTable().query("test2@example.com")
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
