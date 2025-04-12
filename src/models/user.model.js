const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const httpStatus = require('http-status');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');
const { toJSON, paginate } = require('./plugins');
const CONSTANT = require('../lib/constant/error.constant');

const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error(CONSTANT.ERROR_MESSAGE.USER.INVALID_EMAIL);
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (
          !value.match(/\d/) ||
          !value.match(
            /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*`~"()_+\-=[\]{};:'\\|,.<>/?])[A-Za-z\d!@#$%^&*`~"()_+\-=[\]{};:'\\|,.<>/?]{8,}$/
          )
        ) {
          throw new Error(CONSTANT.ERROR_MESSAGE.USER.PASSWORD_MUST);
        }
      },
      private: true, // used by the toJSON plugin
    },
    avatar: {
      type: String,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      default: null,
    },
    verificationCodeExpiry: {
      type: Date,
      default: null,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    lastOtpAttemptDate: {
      type: Date,
      default: null,
    },
    refreshDataAttempts: {
      type: Number,
      default: 0,
    },
    lastRefreshDataAttemptDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

// check and update OTP attempts
userSchema.methods.checkAndUpdateOtpAttempts = async function () {
  const today = new Date();
  if (!this.lastOtpAttemptDate || this.lastOtpAttemptDate.toDateString() !== today.toDateString()) {
    this.otpAttempts = 1;
    this.lastOtpAttemptDate = today;
  } else {
    this.otpAttempts += 1;
  }

  if (this.otpAttempts > config.rate_limit.otp) {
    throw new ApiError(httpStatus.FORBIDDEN, CONSTANT.ERROR_MESSAGE.COMMON.RATE_LIMIT_EXCEEDED);
  }

  await this.save();
};

// check and update refresh data attempts
userSchema.methods.checkAndUpdateRefreshDataAttempts = async function () {
  const today = new Date();
  if (!this.lastRefreshDataAttemptDate || this.lastRefreshDataAttemptDate.toDateString() !== today.toDateString()) {
    this.refreshDataAttempts = 1;
    this.lastRefreshDataAttemptDate = today;
  } else {
    this.refreshDataAttempts += 1;
  }

  if (this.refreshDataAttempts > config.rate_limit.refresh_data) {
    throw new ApiError(httpStatus.FORBIDDEN, CONSTANT.ERROR_MESSAGE.COMMON.REFERESH_RATE_LIMIT_EXCEEDED);
  }

  await this.save();
};

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
