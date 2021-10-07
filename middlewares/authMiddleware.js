const jwt = require('jsonwebtoken');
const { SECRET } = require('../constants');

const auth = (req, res, next) => {
  const token = req.cookies['user'];

  if (token) {
    jwt.verify(token, SECRET, (err, decodedToken) => {
      if (err) {
        throw err;
      }
      req.user = decodedToken;
    });
  }
  next();
};

module.exports = auth;
