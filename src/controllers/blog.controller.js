const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { blogService } = require('../services');

const createBlog = catchAsync(async (req, res) => {
  const { body } = req;

  let tagList = [];

  if (Array.isArray(body.tags)) {
    if (body.tags.length === 1 && typeof body.tags[0] === 'string' && body.tags[0].includes(',')) {
      tagList = body.tags[0].split(',');
    } else {
      tagList = body.tags;
    }
  } else if (typeof body.tags === 'string') {
    tagList = body.tags.split(',');
  }

  body.tags = tagList.map((tag) => tag.trim());
  body.createdBy = req.user._id;

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

  const [result] = blogs;
  return res.status(httpStatus.OK).send(result || { results: [], totalResults: 0, page: 1, limit: 10, totalPages: 0 });
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
