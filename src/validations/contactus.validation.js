const Joi = require('joi');

const addContact = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    name: Joi.string().required(),
    message: Joi.string().required(),
  }),
};

module.exports = {
  addContact,
};
