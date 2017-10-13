const { responseError, responseSuccess, getBrainTreeAuth, getOrderTable } = require('../helpers/utils');
module.exports = [{
  path: '/api/1clickCharge',
  method: 'post',
  handler: (req, res) => {
    const amount = req.body.amount
    const token = req.body.token
    const product = req.body.product
    const checkoutID = req.body.checkoutID
    const clickID = req.body.clickID
    const chtx = req.body.chtx
    let payload = {}

    const gateway = getBrainTreeAuth();
    gateway.transaction.sale({
        amount: amount,
        paymentMethodToken: token,
        options: {
          submitForSettlement: true,
        }
      })
    .then(data => {
      payload = data
      const customer = data.transaction.customer
      const shippingAddress = data.transaction.shipping
      return getOrderTable().put(checkoutID, amount, clickID, customer, shippingAddress, product, chtx)
    })
    .then(data => responseSuccess(res, payload))
    .catch((err) => {
      const body = { error_message: `Problem in creating transactions. ${err.display_message}` };
      responseError(res, body);
    })
  }
}];
