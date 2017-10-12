const { responseError, responseSuccess, getBrainTreeAuth, getOrderTable } = require('../helpers/utils');
module.exports = [{
  path: '/api/postback',
  method: 'post',
  handler: (req, res) => {
    const checkoutID = req.body.checkoutID

    getOrderTable().scan("sentAt","none")
    .then((data) => {
      
      return responseSuccess(res, data)
    })
    .catch(err => responseError(res, err))
  }
}];
