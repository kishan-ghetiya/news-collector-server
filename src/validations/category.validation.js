const Joi = require('joi');
const { objectId } = require('./utils.validation');

const createCategory = {
  body: Joi.object().keys({
    name: Joi.string().required().trim(),
    slug: Joi.string().required().trim().lowercase(),
    description: Joi.string().allow('', null).trim(),
    parentCategory: Joi.string().custom(objectId).allow(null),
    isActive: Joi.boolean(),
    createdBy: Joi.string().custom(objectId),
  }),
};

const updateCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().trim(),
      slug: Joi.string().trim().lowercase(),
      description: Joi.string().allow('', null).trim(),
      parentCategory: Joi.string().custom(objectId).allow(null),
      isActive: Joi.boolean(),
      updatedBy: Joi.string().custom(objectId),
    })
    .min(1),
};

const getCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().required().custom(objectId),
  }),
};

const deleteCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().required().custom(objectId),
  }),
};

module.exports = {
  createCategory,
  updateCategory,
  getCategory,
  deleteCategory,
};
