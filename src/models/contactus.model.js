const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const contactUSSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
contactUSSchema.plugin(toJSON);

/**
 * @typedef ContactUS
 */
const ContactUS = mongoose.model('ContactUS', contactUSSchema);

module.exports = ContactUS;
