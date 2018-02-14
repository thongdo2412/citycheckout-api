const { responseError, responseSuccess } = require('../helpers/utils');
const map = require('../resources/funnel_maps/funnel_map')
module.exports = [{
  path: '/api/getfunnel',
  method: 'get',
  handler: (req, res) => {
    console.log("getFunnel endpoint...")
    body = map.funnelNShipping
    if (body) {
      responseSuccess(res,body)
    }
    else {
      responseError(res,{"error":"true"})
    }
  }
}];
