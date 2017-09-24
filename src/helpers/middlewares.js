const jwt = require('jsonwebtoken');

function parseUserInfo(req, res, next) {
  let username = 'demo@nnetworth.com';
  if ('headers' in req && 'authorization' in req.headers) {
    const userInfo = jwt.decode(req.headers.authorization);
    username = userInfo['cognito:username'];
  }

  req.userInfo = {
    username,
  };

  next();
}

module.exports = {
  parseUserInfo,
};
