const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');

const router = express.Router();

router.route('/get/:userId').get(auth(), validate(userValidation.getUser), userController.getUser);
router.route('/edit-profile/:userId').patch(auth(), validate(userValidation.updateUser), userController.updateUser);
router.route('/delete/:userId').delete(auth(), validate(userValidation.deleteUser), userController.deleteUser);

module.exports = router;
