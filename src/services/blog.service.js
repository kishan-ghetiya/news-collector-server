const httpStatus = require('http-status');
const _ = require('lodash');
const { Blog, BlogBookmark } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a blog
 * @param {Object} body
 * @returns {Promise<Blog>}
 */
const createBlog = async (req, body) => {
  const blogName = body.blog;
  if (await Blog.isExists(blogName)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Blog already exists');
  }

  const blog = await Blog.create(body);

  // Saved in myblogs
  await BlogBookmark.findOneAndUpdate(
    { createdBy: req.user._id },
    { $addToSet: { blogId: blog.id }, createdBy: req.user._id, status: true },
    { upsert: true }
  );
  return blog;
};

/**
 * Query for blogs
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const getBlogList = async (options) => {
  const mongoQuery = [];
  const aggregateQuery = [];
  const mongoObj = {};

  if (options.search) {
    const obj = { $or: [] };
    obj.$or.push({ tags: { $regex: options.search } });
    if (obj.$or.length) {
      mongoQuery.push(obj);
    }
  }

  if (mongoQuery.length) {
    mongoObj.$and = mongoQuery;
  }

  aggregateQuery.push(
    {
      $match: mongoObj,
    },
    {
      $lookup: {
        from: 'users',
        let: { userId: '$submittedBy' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$_id', '$$userId'] }],
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
            },
          },
        ],
        as: 'user',
      },
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    {
      $facet: {
        results: [
          {
            $skip: (parseInt(options.page, 10) - 1) * parseInt(options.limit, 10),
          },
          {
            $limit: parseInt(options.limit, 10),
          },
        ],
        totalResults: [
          {
            $count: 'count',
          },
        ],
      },
    },
    {
      $set: {
        totalResults: {
          $first: {
            $ifNull: ['$totalResults.count', 0],
          },
        },
        page: parseInt(options.page, 10),
        limit: parseInt(options.limit, 10),
      },
    },
    {
      $set: {
        totalPages: {
          $ifNull: [
            {
              $ceil: {
                $cond: [{ $eq: ['$limit', 0] }, 0, { $divide: ['$totalResults', '$limit'] }],
              },
            },
            0,
          ],
        },
      },
    }
  );

  const blogs = await Blog.aggregate(aggregateQuery);
  return blogs;
};

/**
 * Get blog by id
 * @param {ObjectId} blogId
 * @returns {Promise<Blog>}
 */
const getBlogById = async (blogId) => {
  const blog = await Blog.findOne({ _id: blogId });
  return blog;
};

/**
 * Update blog by id
 * @param {ObjectId} blogId
 * @param {Object} obj
 * @returns {Promise<Blog>}
 */
const updateBlog = async (blogId, obj) => {
  const updatedBlog = await Blog.findOneAndUpdate({ _id: blogId }, obj);
  if (!updatedBlog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }
  if (obj.blog && (await Blog.isExists(obj.blog, blogId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Blog already exists.');
  }
  Object.assign(updatedBlog, obj);
  return updatedBlog;
};

/**
 * Delete blog by id
 * @param {ObjectId} blogId
 * @returns {Promise<Blog>}
 */

const deleteBlog = async (blogId) => {
  const deletedBlog = await Blog.findByIdAndDelete(blogId);
  if (!deletedBlog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }
  return deletedBlog;
};

/**
 * Create a bookmark
 * @param {Object} body
 * @returns {Promise<Blog>}
 */
const bookmarkBlog = async (req, body) => {
  if (body.status) {
    const blogIds = body.blogId && body.blogId.length ? body.blogId : [];

    await BlogBookmark.findOneAndUpdate(
      { createdBy: req.user._id },
      { $addToSet: { blogId: blogIds }, createdBy: req.user._id, status: body.status },
      { upsert: true }
    );
    return blogIds;
  }

  const blogIds = body.blogId && body.blogId.length ? body.blogId : [];
  await BlogBookmark.findOneAndUpdate({ createdBy: req.user._id }, { $pull: { blogId: { $in: blogIds } } });
  return blogIds;
};

/**
 * Query for bookmark list
 * @param {Object} id - loggedIn user id
 * @param {Object} options - Query options
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const getBookmarkList = async (userId, options) => {
  const bookmarkedBlogs = await BlogBookmark.aggregate([
    {
      $match: { status: true, createdBy: userId },
    },
    {
      $lookup: {
        from: 'blogs',
        foreignField: '_id',
        localField: 'blogId',
        as: 'blogs',
      },
    },
    {
      $unwind: { path: '$blogs', preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: 'users',
        let: { userId: '$createdBy' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$_id', '$$userId'] }],
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
            },
          },
        ],
        as: 'blogs.submittedBy',
      },
    },
    {
      $unwind: { path: '$blogs.submittedBy', preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        _id: 0,
        blogs: 1,
        user: 1,
      },
    },
    {
      $facet: {
        results: [
          {
            $sort: options.sort,
          },
          {
            $skip: (options.page - 1) * parseInt(options.limit, 10),
          },
          {
            $limit: parseInt(options.limit, 10),
          },
        ],
        totalResults: [
          {
            $count: 'count',
          },
        ],
      },
    },
    {
      $set: {
        totalResults: {
          $first: {
            $ifNull: ['$totalResults.count', 0],
          },
        },
        page: parseInt(options.page, 10),
        limit: parseInt(options.limit, 10),
      },
    },
    {
      $set: {
        totalPages: {
          $ifNull: [
            {
              $ceil: {
                $cond: [{ $eq: ['$limit', 0] }, 0, { $divide: ['$totalResults', '$limit'] }],
              },
            },
            0,
          ],
        },
      },
    },
  ]);

  const blogs = _.reduce(
    bookmarkedBlogs[0].results,
    (blog, val) => {
      blog.push(val.blogs);
      return blog;
    },
    []
  );

  bookmarkedBlogs[0].results = blogs.reverse();
  return bookmarkedBlogs[0];
};

module.exports = {
  createBlog,
  getBlogList,
  getBlogById,
  updateBlog,
  deleteBlog,
  bookmarkBlog,
  getBookmarkList,
};
