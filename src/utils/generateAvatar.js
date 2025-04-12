import { AvatarGenerator } from 'random-avatar-generator';  // Import the AvatarGenerator class

// Function to generate the avatar only if an email is provided
const genAvatar = (user) => {
  const generator = new AvatarGenerator();  // Create an instance of AvatarGenerator

  // Check if the email is available and profileImage is not set
  if (user.email && !user.profileImage) {
    const avatarUrl = generator.generateRandomAvatar(user.email); // Generate avatar based on the email
    console.log('Generated Avatar URL:', avatarUrl);  // Debugging line
    user.profileImage = avatarUrl;  // Assign the generated avatar to the user
  } else {
    console.log('User email is not available or profileImage is already set');
  }
};

export default genAvatar;
