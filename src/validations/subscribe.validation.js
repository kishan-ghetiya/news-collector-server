const Joi = require('joi');

const subscribeEmail = Joi.object({
  email: Joi.string().email().required(),
});

module.exports = { subscribeEmail };
