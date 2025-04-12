const { AvatarGenerator } = require('random-avatar-generator');

// Generate 6-digit numeric code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate profile avatar
const generateAvatar = (user) => {
  const generator = new AvatarGenerator();

  if (user.email && !user.avatar) {
    const avatarUrl = generator.generateRandomAvatar(user.email);
    user.avatar = avatarUrl;
  }
};

module.exports = {
  generateVerificationCode,
  generateAvatar,
};
