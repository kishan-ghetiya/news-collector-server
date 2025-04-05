const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const encryptor = require('simple-encryptor')(process.env.SIMPLE_ENCRYPTOR_KEY);
const tokenService = require('./token.service');
const userService = require('./user.service');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const CONSTANT = require('../lib/constant/error.constant');

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (user && user.isEmailVerified !== true) {
    throw new ApiError(httpStatus.FORBIDDEN, CONSTANT.ERROR_MESSAGE.AUTH.VERIFY_EMAIL);
  }
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, CONSTANT.ERROR_MESSAGE.AUTH.INCORRECT_EMAIL);
  }

  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOneAndDelete({
    token: refreshToken,
    type: tokenTypes.REFRESH,
    blacklisted: false,
  });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, CONSTANT.ERROR_MESSAGE.TOKEN.TOKEN_NOT_FOUND);
  }
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();

    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, CONSTANT.ERROR_MESSAGE.COMMON.PLEASE_AUTHENTICATE);
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    const password = await bcrypt.hash(newPassword, 8);
    await userService.updateUserById(user.id, { password });
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, CONSTANT.ERROR_MESSAGE.AUTH.PASSWORD_RESET);
  }
};

/**
 * Change password
 * @param {string} userId
 * @param {string} oldPassword
 * @param {string} newPassword
 * @returns {Promise}
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await userService.getUserById(userId);

  if (!user || !(await user.isPasswordMatch(oldPassword))) {
    throw new ApiError(httpStatus.BAD_REQUEST, CONSTANT.ERROR_MESSAGE.USER.INCORRECT_PASSWORD);
  }

  const password = await bcrypt.hash(newPassword, 8);
  const updatedUser = await userService.updateUserById(userId, { $set: { password } });

  return updatedUser;
};

/**
 * Verify email
 * @param {string} userId
 * @param {string} verifyCode
 * @returns {Promise}
 */
const verifyEmail = async (userId, verifyCode) => {
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, CONSTANT.ERROR_MESSAGE.COMMON.USER_NOT_FOUND);
  }
  const encryptedCode = encryptor.encrypt(verifyCode);
  const verificationCode = encryptor.decrypt(user.verificationCode);
  const code = encryptor.decrypt(encryptedCode);

  if (verificationCode !== code) {
    throw new ApiError(httpStatus.BAD_REQUEST, CONSTANT.ERROR_MESSAGE.AUTH.INVALID_VERIFICATION_CODE);
  }

  if (user.verificationCodeExpiry < new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, CONSTANT.ERROR_MESSAGE.AUTH.VERIFICATION_CODE_EXPIRED);
  }

  Object.assign(user, {
    verificationCode: null,
    verificationCodeExpiry: null,
    isEmailVerified: true,
  });

  await user.save();

  return user;
};

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  changePassword,
  verifyEmail,
};
