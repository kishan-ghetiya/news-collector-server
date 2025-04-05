const httpStatus = require('http-status');
const isEmpty = require('lodash/isEmpty');
const moment = require('moment');
const encryptor = require('simple-encryptor')(process.env.SIMPLE_ENCRYPTOR_KEY);
const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');
const { authService, userService, tokenService, utilsService } = require('../services');
const { emailService } = require('../lib/email');
const { User } = require('../models');
const CONSTANT = require('../lib/constant/error.constant');

const register = catchAsync(async (req, res) => {
  let user = await userService.getUserByEmail(req.body.email);

  if (user) {
    // Check if the verification code has expired
    if (moment().isAfter(user.verificationCodeExpiry)) {
      // If expired, generate a new verification code and resend the email
      const code = utilsService.generateVerificationCode();
      const encryptedCode = encryptor.encrypt(code);
      user.verificationCode = encryptedCode;
      user.verificationCodeExpiry = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
      await user.save();

      // Resend the verification email
      await emailService.sendVerificationEmail(user, code);

      return res.status(httpStatus.OK).send({
        user,
        message: CONSTANT.ERROR_MESSAGE.AUTH.VERIFICATION_CODE_EXPIRED_NEW_SENT,
      });
    }

    // If verification code is still valid, inform the user to verify their email
    if (user && user.isEmailVerified) {
      return res.status(httpStatus.BAD_REQUEST).send({
        message: CONSTANT.ERROR_MESSAGE.AUTH.EMAIL_ALREADY_VERIFIED_REGISTERED,
      });
    }
    return res.status(httpStatus.BAD_REQUEST).send({
      message: CONSTANT.ERROR_MESSAGE.AUTH.EMAIL_ALREADY_REGISTERED,
    });
  }

  // If the user doesn't exist, create a new user
  user = await userService.createUser(req.body);

  const code = utilsService.generateVerificationCode();
  const encryptedCode = encryptor.encrypt(code);
  user.verificationCode = encryptedCode;
  user.verificationCodeExpiry = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  user.notificationEmails = [req.body.email];
  await user.save();

  await emailService.sendVerificationEmail(user, code);

  res.status(httpStatus.CREATED).send({
    user,
    message: CONSTANT.ERROR_MESSAGE.AUTH.REGISTER_SUCCESSFUL,
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);

  const tokens = await tokenService.generateAuthTokens(user);

  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);

  res.status(httpStatus.OK).json({ message: CONSTANT.ERROR_MESSAGE.AUTH.LOGGED_OUT });
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);

  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  const resetPasswordToken = await tokenService.generateResetPasswordToken(email);
  const user = await userService.getUserByEmail(email);
  await emailService.sendResetPasswordEmail(user, resetPasswordToken);

  res.status(httpStatus.OK).send({ message: CONSTANT.ERROR_MESSAGE.AUTH.RESET_PASSWORD_LINK });
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);

  res.status(httpStatus.OK).send({ message: CONSTANT.ERROR_MESSAGE.AUTH.PASSWORD_RESET_SUCCESS });
});

const changePassword = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const user = await authService.changePassword(userId, req.body.oldPassword, req.body.newPassword);
  if (user) {
    res.status(httpStatus.OK).send({ message: CONSTANT.ERROR_MESSAGE.AUTH.PASSWORD_UPDATED });
  }
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await userService.getUserByEmail(email);
  if (isEmpty(user)) {
    return res.status(400).json({ message: CONSTANT.ERROR_MESSAGE.AUTH.USER_NOT_FOUND_REGISTER });
  }

  if (user && user.isEmailVerified === true) {
    return res.status(400).json({ message: CONSTANT.ERROR_MESSAGE.AUTH.EMAIL_ALREADY_EXISTS });
  }

  await user.checkAndUpdateOtpAttempts();

  const code = utilsService.generateVerificationCode();
  const encryptedCode = encryptor.encrypt(code);
  user.verificationCode = encryptedCode;
  user.verificationCodeExpiry = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  await user.save();

  if (user) {
    await emailService.sendVerificationEmail(user, code);
  }

  res.status(httpStatus.OK).send({ message: CONSTANT.ERROR_MESSAGE.AUTH.VERIFICATION_CODE_SENT });
});

const verifyEmail = catchAsync(async (req, res) => {
  const { userId, verificationCode } = req.query;

  let user = await authService.verifyEmail(userId, verificationCode);
  if (!user) {
    res.status(404).send({ message: CONSTANT.ERROR_MESSAGE.COMMON.USER_NOT_FOUND });
  }
  user = await User.findByIdAndUpdate(user.id, { new: true });

  await emailService.signupMail(user);

  res.send({ user });
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  changePassword,
  sendVerificationEmail,
  verifyEmail,
};
