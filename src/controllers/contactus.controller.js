const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { contactusService } = require('../services');
const CONSTANT = require('../lib/constant/error.constant');

const submitContact = catchAsync(async (req, res) => {
  const { name, email, message } = req.body;

  await contactusService.addContact({ name, email, message });

  res.status(httpStatus.OK).json({ success: CONSTANT.SUCCESS_MESSAGE.CONTACT_US.MESSAGE_SENT });
});
module.exports = {
  submitContact,
};
