const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { blogService } = require('../services');

const createBlog = catchAsync(async (req, res) => {
  const { body } = req;
  const tagList = body.tags.split(',');
  body.tags = [];
  tagList.forEach((tag) => {
    body.tags.push(tag.trim());
  });

  body.submittedBy = req.user._id;

  const blog = await blogService.createBlog(req, body);
  res.status(httpStatus.CREATED).send({ blog });
});

const updateBlog = catchAsync(async (req, res) => {
  const blog = await blogService.updateBlog(req.params.blogId, req.body);
  return res.status(httpStatus.OK).send({ blog });
});

const getBlog = catchAsync(async (req, res) => {
  const blog = await blogService.getBlogById(req.params.blogId);
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }
  return res.status(httpStatus.OK).send({ blog });
});

const getBlogs = catchAsync(async (req, res) => {
  const options = pick(req.query, ['limit', 'page', 'search']);
  const blogs = await blogService.getBlogList(options);
  return res.status(httpStatus.OK).send({ results: blogs });
});

const deleteBlog = catchAsync(async (req, res) => {
  await blogService.deleteBlog(req.params.blogId);
  return res.status(httpStatus.OK).send({ message: 'Blog deleted' });
});

module.exports = {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
};
