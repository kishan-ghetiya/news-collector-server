const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const CONSTANT = require('../lib/constant/error.constant');

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, CONSTANT.ERROR_MESSAGE.COMMON.PLEASE_AUTHENTICATE));
  }
  req.user = user;

  if (requiredRights.length) {
    if (req.params.userId !== user.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, CONSTANT.ERROR_MESSAGE.MIDDLEWARE.DONT_HAVE_PERMISSION));
    }
  }
  resolve();
};

const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

module.exports = auth;
