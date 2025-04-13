const express = require('express');
const validate = require('../../middlewares/validate');
const subscribeValidation = require('../../validations/subscribe.validation');
const subscribeController = require('../../controllers/subscribe.controller');

const router = express.Router();

router.post('/email', validate(subscribeValidation.subscribeEmail), subscribeController.subscribe);

module.exports = router;
