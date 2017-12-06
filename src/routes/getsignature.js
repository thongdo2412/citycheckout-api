const { responseError, responseSuccess, sign } = require('../helpers/utils');
module.exports = [{
  path: '/api/getsignature',
  method: 'post',
  handler: (req, res) => {
    const params = req.body
    let result = {}
    result['signature'] = sign(params)
    return responseSuccess(res,result)
  }
}];
