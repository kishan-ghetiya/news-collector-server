const Joi = require('joi');
const { objectId } = require('./utils.validation');

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      fullName: Joi.string(),
      oldPassword: Joi.string().allow('').optional(),
      newPassword: Joi.string().allow('').optional(),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  getUser,
  updateUser,
  deleteUser,
};
