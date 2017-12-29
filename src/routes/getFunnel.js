const { responseError, responseSuccess } = require('../helpers/utils');
const map = require('../resources/funnel_maps/funnel_map')
module.exports = [{
  path: '/api/getfunnel',
  method: 'get',
  handler: (req, res) => {
    body = map.funnelNShipping
    return responseSuccess(res,body)
  }
}];
