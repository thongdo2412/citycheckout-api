const { responseError, responseSuccess, getBrainTreeAuth, getOrderTable } = require('../helpers/utils');
module.exports = [{
  path: '/api/aClickCharge',
  method: 'post',
  handler: (req, res) => {
    const amount = req.body.amount
    const token = req.body.token
    const product = req.body.product
    const checkoutID = req.body.checkoutID
    const clickID = req.body.clickID
    const chtx = req.body.chtx
    const shipAmount = req.body.shipAmount
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
      const shipping_address = data.transaction.shipping
      const trans_id = data.transaction.id
      return getOrderTable().put(checkoutID, amount, clickID, customer, shipping_address, product, chtx, shipAmount, trans_id)
    })
    .then(data => responseSuccess(res, payload))
    .catch((err) => {
      const body = { error_message: `Problem in creating transactions. ${err.display_message}` };
      responseError(res, body);
    })
  }
}];
