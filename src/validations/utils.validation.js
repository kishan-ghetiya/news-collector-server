const CONSTANT = require('../lib/constant/error.constant');

const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.message(CONSTANT.ERROR_MESSAGE.USER.PASSWORD_MUST_8_CHARACTERS);
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message(CONSTANT.ERROR_MESSAGE.USER.PASSWORD_MUST);
  }
  return value;
};

module.exports = {
  objectId,
  password,
};
