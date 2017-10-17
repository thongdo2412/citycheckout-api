const { responseError, responseSuccess, getBrainTreeAuth, getOrderTable } = require('../helpers/utils');
module.exports = [{
  path: '/api/refund',
  method: 'post',
  handler: (req, res) => {
    console.log("this is refund")
    return responseSuccess(res, {})
    .catch((err) => responseError(res,err))
  }
}];
