const Subscribe = require('../models/subscribe.model');

const subscribeEmail = async (email) => {
  const existing = await Subscribe.findOne({ email });
  if (existing) {
    throw new Error('Email is already subscribed');
  }
  return await Subscribe.create({ email });
};

module.exports = { subscribeEmail };
