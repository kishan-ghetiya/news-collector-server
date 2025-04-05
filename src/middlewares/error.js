const mongoose = require('mongoose');
const httpStatus = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const { sendEmail } = require('../lib/email/email.service');

const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = async (err, req, res, next) => {
  let { statusCode, message } = err;
  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  };

  if (config.env === 'development') {
    logger.error(err);
  }
  if (statusCode >= 500) {
    const mailBody = `<div>
      <p><strong>Env: </strong> ${config.env}</p>
      <p><strong>Path: </strong> ${req.originalUrl}</p>
      <p><strong>Status code: </strong>${statusCode}</p>
      <p><strong>Error message: </strong>${message}</p>
      <p><strong>Error stack: </strong>${err.stack}</p>
      <p><strong>User: </strong>${req.user ? req.user.email : 'N/A'}</p>
    </div >`;

    const mailSubject = `News Collector ${config.env}-Internal Server Error!!`;
    const sendErrorMailTo = config.email_alert.split(',').map((mail) => mail.trim());

    if (process.env.SEND_ERROR_EMAIL === 'true') {
      await sendEmail(sendErrorMailTo, mailSubject, mailBody);
    }
  }
  res.status(statusCode).send(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
