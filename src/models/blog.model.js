const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');

const blogSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    tags: {
      type: Array,
      required: true,
      default: [],
    },
    blog_hash: {
      type: String,
      unique: true,
      trim: true,
    },
    summary: {
      type: String,
      // required: false,
      trim: true,
    },
    submittedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      trim: true,
    },
    submittedUrl: {
      type: String,
      // required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

blogSchema.plugin(toJSON);
blogSchema.plugin(paginate);

/**
 * @typedef Blog
 */
blogSchema.statics.isExists = async function (blog) {
  const result = await this.findOne({ blog });
  return !!result;
};

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
