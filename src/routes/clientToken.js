const Promise = require('bluebird');
const { responseError, responseSuccess, getAccountTable, getPlaid, getBrainTreeAuth } = require('../helpers/utils');
module.exports = [{
  path: '/api/client-token',
  method: 'get',
  handler: (req, res) => {
    const gateway = getBrainTreeAuth();
    gateway.clientToken.generate({})
    .then(data => responseSuccess(res, data))
    .catch(err => responseError(res, err));
  }
}];
