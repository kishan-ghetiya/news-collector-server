const express = require('express');
const validate = require('../../middlewares/validate');
const contactusValidation = require('../../validations/contactus.validation');
const contactusController = require('../../controllers/contactus.controller');

const router = express.Router();

router.post('/submit', validate(contactusValidation.addContact), contactusController.submitContact);

module.exports = router;
