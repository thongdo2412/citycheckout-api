const { responseError, responseSuccess, postToExtAPI, sign } = require('../helpers/utils');
module.exports = [{
  path: '/api/oneclicksale',
  method: 'post',
  handler: (req, res) => {
    const params = req.body
    const CS_URL = 'https://testsecureacceptance.cybersource.com/silent/pay'
    let CS_body = {}
    const signedDataFields = params.signed_field_names.split(',')
    signedDataFields.map(item=>{
        CS_body[item] = params[item]
    })
    CS_body['signature'] = sign(params)
    // console.log(CS_body['signature'])
    // return responseSuccess(res, {"signature": CS_body['signature']})
    postToExtAPI(CS_URL,{},CS_body,"form")
    .then(data => responseSuccess(res, data))
    .catch((err) => {
      const body = { error_message: `Problem in creating transactions. ${err.display_message}` };
      responseError(res, body);
    })
  }
}];
