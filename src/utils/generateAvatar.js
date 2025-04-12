import { AvatarGenerator } from 'random-avatar-generator';

// Function to generate the avatar only if an email is provided
const genAvatar = (user) => {
  const generator = new AvatarGenerator();

  // Check if the email is available and profileImage is not set
  if (user.email && !user.profileImage) {
    const avatarUrl = generator.generateRandomAvatar(user.email); // Generate avatar based on the email
    user.profileImage = avatarUrl;
  } else {
    user.profileImage = '';
  }
};

export default genAvatar;
