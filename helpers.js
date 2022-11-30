const getUserByEmail = (email, database) => {
  let userData;
  if (validEmail === false) return userData;

  userData = Object.values(database)
    .find(userId => userId.email === email);

  return userData;
};

module.exports = {
  getUserByEmail,
}