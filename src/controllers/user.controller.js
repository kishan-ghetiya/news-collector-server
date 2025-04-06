const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const CONSTANT = require('../lib/constant/error.constant');

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);

  const userProfile = {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
  };

  res.send(userProfile);
});

const updateUser = catchAsync(async (req, res) => {
  const { oldPassword, newPassword, ...updateData } = req.body;

  if (oldPassword && newPassword) {
    const existingUser = await userService.getUserById(req.params.userId);
    if (!existingUser || !(await existingUser.isPasswordMatch(oldPassword))) {
      throw new ApiError(httpStatus.BAD_REQUEST, CONSTANT.ERROR_MESSAGE.USER.CURRENT_PASSWORD_INCORRECT);
    }

    // Hash and update the new password
    const password = await bcrypt.hash(newPassword, 8);
    updateData.password = password;
  }

  const user = await userService.updateUserById(req.params.userId, updateData);

  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.OK).json({ message: CONSTANT.ERROR_MESSAGE.USER.USER_DELETED });
});

module.exports = {
  getUser,
  updateUser,
  deleteUser,
};
