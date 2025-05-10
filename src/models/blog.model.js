const mongoose = require('mongoose');
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
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    summary: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
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
