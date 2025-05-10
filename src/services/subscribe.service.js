const Subscribe = require('../models/subscribe.model');

const subscribeEmail = async (email) => {
  const existing = await Subscribe.findOne({ email });
  if (existing) {
    throw new Error('Email is already subscribed');
  }
  return await Subscribe.create({ email });
};

const unsubscribeEmail = async (email) => {
  const existing = await Subscribe.findOne({ email });
  if (!existing) {
    throw new Error('Email not found');
  }
  await Subscribe.deleteOne({ email });
};

module.exports = {
  subscribeEmail,
  unsubscribeEmail,
};
