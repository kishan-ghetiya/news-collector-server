const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { categoryService } = require('../services');

const createCategory = catchAsync(async (req, res) => {
  const { body } = req;
  body.createdBy = req.user._id;
  const category = await categoryService.createCategory(body);
  res.status(httpStatus.CREATED).send({ message: 'Category created successfully', category });
});

const updateCategory = catchAsync(async (req, res) => {
  const updatedData = { ...req.body, updatedBy: req.user._id };
  const category = await categoryService.updateCategory(req.params.categoryId, updatedData);
  return res.status(httpStatus.OK).send({ message: 'Category updated successfully', category });
});

const getCategory = catchAsync(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  return res.status(httpStatus.OK).send({ category });
});

const getCategoryList = catchAsync(async (req, res) => {
  const options = pick(req.query, ['limit', 'page', 'search']);
  const categories = await categoryService.getCategoryList(options);
  return res.status(httpStatus.OK).send(categories);
});

const deleteCategory = catchAsync(async (req, res) => {
  await categoryService.deleteCategory(req.params.categoryId);
  return res.status(httpStatus.OK).send({ message: 'Category deleted successfully' });
});

module.exports = {
  createCategory,
  getCategoryList,
  getCategory,
  updateCategory,
  deleteCategory,
};
