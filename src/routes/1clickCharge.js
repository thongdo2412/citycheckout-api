const { responseError, responseSuccess, getBrainTreeAuth } = require('../helpers/utils');
module.exports = [{
  path: '/api/1clickCharge',
  method: 'post',
  handler: (req, res) => {
    const amount = req.body.amount;
    const token = req.body.token;

    const gateway = getBrainTreeAuth();

    gateway.transaction.sale({
        amount: amount,
        paymentMethodToken: token,
        options: {
          submitForSettlement: true,
        }
      })
    .then(data => responseSuccess(res, data))
    .catch((err) => {
      const body = { error_message: `Problem in creating transactions. ${err.display_message}` };
      responseError(res, body);
    });
  }
}];
