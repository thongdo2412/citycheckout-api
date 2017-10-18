// const { responseError, responseSuccess, getBrainTreeAuth, getOrderTable } = require('../helpers/utils');
// module.exports = [{
//   path: '/webhooks/refund',
//   method: 'get',
//   handler: (req, res) => {
//     console.log("this is refund")
//     .then(data => responseSuccess(res,data))
//     .catch((err) => responseError(res,err))
//   }
// }];
module.exports.create = function(req, res) {
    // create new refund
    console.log(req.body)
    res.sendStatus(200)
};
