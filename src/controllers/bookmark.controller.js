const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { blogService } = require('../services');

const bookmarkBlog = catchAsync(async (req, res) => {
  const { body } = req;
  body.createdBy = req.user._id;
  const blog = await blogService.bookmarkBlog(req, body);
  if (blog) {
    res.status(httpStatus.CREATED).send({ message: body.status ? 'Bookmarked saved' : 'Removed from bookmarked' });
  }
});

const getBookmarkBlog = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'sort']);
  const sort = {};
  sort[options.sortBy] = options.sort === 'desc' ? -1 : 1;
  options.sort = sort;
  const result = await blogService.getBookmarkList(userId, options);
  return res.status(httpStatus.OK).send(result);
});

module.exports = {
  bookmarkBlog,
  getBookmarkBlog,
};
