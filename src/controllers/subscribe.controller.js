const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { subscribeService } = require('../services');
const CONSTANT = require('../lib/constant/error.constant');

const subscribe = catchAsync(async (req, res) => {
  const { email } = req.body;

  await subscribeService.subscribeEmail(email);

  res.status(httpStatus.OK).json({ success: CONSTANT.SUCCESS_MESSAGE.SUBSCRIBE.SUBSCRIBED });
});

module.exports = {
  subscribe,
};
