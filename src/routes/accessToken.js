const { responseError, responseSuccess, getAccountTable, getPlaid } = require('../helpers/utils');

module.exports = [{
  path: '/api/access-token',
  method: 'post',
  handler: (req, res) => {
    if (!('body' in req) || !('public_token' in req.body)) {
      responseError(res, new Error('Missing required public_token body.'));
    }

    const publicToken = req.body.public_token;
    const plaid = getPlaid();

    plaid.exchangePublicToken(publicToken, (error, response) => {
      if (error) {
        return responseError(res, error);
      }

      // TODO fix this api
      const accessToken = response.access_token;
      return getAccountTable(req)
        .addToSet('access-tokens', 'tokens', accessToken)
        .then(data => responseSuccess(res, data))
        .catch(err => responseError(res, err));
    });
  },
}];
