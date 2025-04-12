const Joi = require('joi');
const { objectId } = require('./utils.validation');

const createBlog = {
  body: Joi.object().keys({
    title: Joi.string().required().trim(),
    link: Joi.string().uri().required().trim(),
    tags: Joi.alternatives()
      .try(Joi.array().items(Joi.string()), Joi.string())
      .custom((value, helpers) => {
        if (typeof value === 'string') {
          return value.split(',').map((tag) => tag.trim());
        }
        if (Array.isArray(value) && value.length === 1 && typeof value[0] === 'string' && value[0].includes(',')) {
          return value[0].split(',').map((tag) => tag.trim());
        }
        return value;
      })
      .required(),
    category: Joi.string().required().custom(objectId),
    summary: Joi.string().allow(null, '').trim(),
    createdBy: Joi.string().custom(objectId),
  }),
};

const updateBlog = {
  params: Joi.object().keys({
    blogId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string().trim(),
      link: Joi.string().uri().trim(),
      tags: Joi.alternatives()
        .try(Joi.array().items(Joi.string()), Joi.string())
        .custom((value, helpers) => {
          if (typeof value === 'string') {
            return value.split(',').map((tag) => tag.trim());
          }
          if (Array.isArray(value) && value.length === 1 && typeof value[0] === 'string' && value[0].includes(',')) {
            return value[0].split(',').map((tag) => tag.trim());
          }
          return value;
        }),
      category: Joi.string().custom(objectId),
      summary: Joi.string().allow(null, '').trim(),
      createdBy: Joi.string().custom(objectId),
    })
    .min(1),
};

const getBlog = {
  params: Joi.object().keys({
    blogId: Joi.string().required().custom(objectId),
  }),
};

const deleteBlog = {
  params: Joi.object().keys({
    blogId: Joi.string().required().custom(objectId),
  }),
};

module.exports = {
  createBlog,
  updateBlog,
  getBlog,
  deleteBlog,
};
