const bcryptjs = require('bcryptjs');

exports.genPassword = async (password) => {
  console.log('i am called');
  const saltRounds = 10; // It's better to use a variable name that indicates what it is for clarity
  try {
    const hash = await bcryptjs.hash(password, saltRounds);
    return hash;
  } catch (err) {
    console.error('Error generating password hash:', err);
    throw err; // Re-throw the error to handle it in the calling function
  }
};
exports.ValidPassword = async (plainTextPassword, hashedPassword) => {
  console.log(plainTextPassword, hashedPassword);
  try {
    const isMatch = await bcryptjs.compare(plainTextPassword, hashedPassword);
    if (isMatch) {
      console.log('Passwords match!');
      return true;
    } else {
      console.log('Passwords do not match.');
      return false;
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};
