const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const blogBookmarkSchema = mongoose.Schema(
  {
    status: {
      type: Boolean,
      required: true,
    },
    blogId: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: 'Blog',
        trim: true,
      },
    ],
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

blogBookmarkSchema.plugin(toJSON);
blogBookmarkSchema.plugin(paginate);

const BlogBookmark = mongoose.model('BlogBookmark', blogBookmarkSchema);

module.exports = BlogBookmark;
