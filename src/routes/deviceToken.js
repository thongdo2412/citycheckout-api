const { responseError, responseSuccess, getAccountTable } = require('../helpers/utils');


module.exports = [{
  path: '/api/device-tokens',
  method: 'get',
  handler: (req, res) => {
    getAccountTable(req).simpleGet('device-tokens')
      .then(data => responseSuccess(res, data))
      .catch(err => responseError(res, err));
  },
}, {
  path: '/api/device-tokens',
  method: 'put',
  handler: (req, res) => {
    const payload = req.body;

    Object.keys(payload).map(key => (payload[key].addedAt = Date.now()));

    getAccountTable(req).simpleUpdate('device-tokens', { tokens: payload })
      .then(data => responseSuccess(res, data))
      .catch(err => responseError(res, err));
  },
}];
