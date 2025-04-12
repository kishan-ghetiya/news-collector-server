const httpStatus = require('http-status');
const { Category } = require('../models');
const ApiError = require('../utils/ApiError');

const createCategory = async (body) => {
  const existing = await Category.findOne({ name: body.name });
  if (existing) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Category already exists');
  }

  const category = await Category.create(body);
  return category;
};

const getCategoryList = async ({ limit = 10, page = 1, search = '' }) => {
  const query = {};
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const options = {
    limit: parseInt(limit, 10),
    page: parseInt(page, 10),
  };

  const categories = await Category.paginate(query, options);
  return categories;
};

const getCategoryById = async (categoryId) => {
  return await Category.findById(categoryId);
};

const updateCategory = async (categoryId, updates) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  if (updates.name && updates.name !== category.name) {
    const exists = await Category.findOne({ name: updates.name });
    if (exists) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Another category with this name already exists');
    }
  }

  Object.assign(category, updates);
  await category.save();
  return category;
};

const deleteCategory = async (categoryId) => {
  const deleted = await Category.findByIdAndDelete(categoryId);
  if (!deleted) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  return deleted;
};

module.exports = {
  createCategory,
  getCategoryList,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
