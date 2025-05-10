const express = require('express');
const validate = require('../../middlewares/validate');
const subscribeValidation = require('../../validations/subscribe.validation');
const subscribeController = require('../../controllers/subscribe.controller');

const router = express.Router();

router.post('/subscribe', validate(subscribeValidation.subscribeEmail), subscribeController.subscribe);
router.post('/unsubscribe', validate(subscribeValidation.subscribeEmail), subscribeController.unsubscribe);

module.exports = router;
