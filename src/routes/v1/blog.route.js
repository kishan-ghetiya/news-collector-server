const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const blogValidation = require('../../validations/blog.validation');
const blogController = require('../../controllers/blog.controller');
const blogBookmarkController = require('../../controllers/bookmark.controller');

const router = express.Router();

router.route('/create').post(auth(), validate(blogValidation.createBlog), blogController.createBlog);
router.route('/edit/:blogId').patch(auth(), validate(blogValidation.updateBlog), blogController.updateBlog);
router.route('/delete/:blogId').delete(auth(), validate(blogValidation.deleteBlog), blogController.deleteBlog);

// get blog routes
router.route('/:blogId').get(validate(blogValidation.getBlog), blogController.getBlog);
router.route('/list').get(blogController.getBlogs);

// bookmark routes
router.route('/bookmark').post(auth(), validate(blogValidation.register), blogBookmarkController.bookmarkBlog);
router.route('/bookmarks/get').get(auth(), validate(blogValidation.register), blogBookmarkController.getBookmarkBlog);

module.exports = router;
