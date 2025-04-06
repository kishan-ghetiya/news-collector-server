const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
// const blogValidation = require('../../validations/blog.validation');
const blogController = require('../../controllers/blog.controller');
const blogBookmarkController = require('../../controllers/bookmark.controller');

const router = express.Router();

router.route('/create').post(auth(), blogController.createBlog);
router.route('/list').get(blogController.getBlogs);
router.route('/:blogId').get(auth(), blogController.getBlog);
router.route('/edit/:blogId').patch(auth(), blogController.updateBlog);
router.route('/delete/:blogId').delete(auth(), blogController.deleteBlog);

// bookmark routes
router.route('/bookmark').post(auth(), blogBookmarkController.bookmarkBlog);
router.route('/bookmarks/get').get(auth(), blogBookmarkController.getBookmarkBlog);

module.exports = router;
