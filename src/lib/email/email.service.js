/* eslint-disable no-console */
/* eslint-disable security/detect-non-literal-fs-filename */
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const config = require('../../config/config');
const logger = require('../../config/logger');

handlebars.registerPartial('header', fs.readFileSync(path.join(__dirname, '/templates/partials/header.hbs'), 'utf8'));
handlebars.registerPartial('signoff', fs.readFileSync(path.join(__dirname, '/templates/partials/signoff.hbs'), 'utf8'));
handlebars.registerPartial('footer', fs.readFileSync(path.join(__dirname, '/templates/partials/footer.hbs'), 'utf8'));

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text) => {
  const msg = { from: 'kishanp.ghetiya@gmail.com', to, subject, html: text };
  await transport.sendMail(msg);
};

/**
 * Email param
 * @param {string} user
 * @param {string} token
 * @returns {Promise}
 */

const sendResetPasswordEmail = async (user, token) => {
  try {
    const subject = 'Reset your password';
    const username = `${user.fullName}`;
    const resetPasswordLink = `${process.env.APP_URL}/reset-password?token=${token}`;
    const source = fs.readFileSync(`${__dirname}/templates/resetPassword.hbs`, { encoding: 'utf8', flag: 'r' });
    const template = handlebars.compile(source);
    const data = { username, resetPasswordLink };
    const result = template(data);

    await sendEmail(user.email, subject, result);
  } catch (error) {
    console.error('Error sending reset password email:', error);
  }
};

const sendVerificationEmail = async (user, verificationCode) => {
  try {
    const subject = 'Verifiy your account';
    const username = `${user.fullName}`;
    const source = fs.readFileSync(`${__dirname}/templates/verificationEmail.hbs`, {
      encoding: 'utf8',
      flag: 'r',
    });
    const template = handlebars.compile(source);
    const data = { username, verificationCode };
    const result = template(data);

    await sendEmail(user.email, subject, result);
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

const signupMail = async (user) => {
  try {
    const subject = `Welcome to News Collector`;
    const username = `${user.fullName}`;
    const source = fs.readFileSync(`${__dirname}/templates/signUpMail.hbs`, {
      encoding: 'utf8',
      flag: 'r',
    });
    const template = handlebars.compile(source);
    const loginLink = `${process.env.APP_URL}/login`;
    const data = { username, loginLink };
    const result = template(data);

    await sendEmail(user.email, subject, result);
  } catch (error) {
    console.error('Error sending signup email:', error);
  }
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  signupMail,
};
