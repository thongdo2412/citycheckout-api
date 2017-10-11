const { responseError, responseSuccess, getBrainTreeAuth } = require('../helpers/utils');
const Promise = require('bluebird');
const config = require('../config');
module.exports = [{
  path: '/api/getFunnel',
  method: 'get',
  handler: (req, res) => {
    body = config.funnelNShipping
    return responseSuccess(res, body)
  }
}];
