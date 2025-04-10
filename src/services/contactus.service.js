const { ContactUS } = require('../models');

const addContact = async (contact) => {
  return ContactUS.create(contact);
};

module.exports = {
  addContact,
};
