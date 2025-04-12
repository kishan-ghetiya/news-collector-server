const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const categoryValidation = require('../../validations/category.validation');
const categoryController = require('../../controllers/category.controller');

const router = express.Router();

router.route('/create').post(auth(), validate(categoryValidation.createCategory), categoryController.createCategory);
router
  .route('/edit/:categoryId')
  .patch(auth(), validate(categoryValidation.updateCategory), categoryController.updateCategory);
router
  .route('/delete/:categoryId')
  .delete(auth(), validate(categoryValidation.deleteCategory), categoryController.deleteCategory);

// get category routes
router.route('/get/:categoryId').get(validate(categoryValidation.getCategory), categoryController.getCategory);
router.route('/list').get(categoryController.getCategoryList);

module.exports = router;
