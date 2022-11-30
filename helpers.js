const authenticateUser = (email, password, datasetUser) => {
  if (validEmail(email) === false || validEmail(password) === false) return false;

  // Find a user record that matches the provided email and password
  const userObject = Object.values(datasetUser)
    .find(userId => userId.email === email &&
      bcrypt.compareSync(password, userId.password)
    );
  
  // If a user was found, then this user is authenticated
  const isauthenticateUser = userObject !== undefined;
  return isauthenticateUser;
};

const existsUrlId = (urlId, datasetUrl) => {
  if (validUrlId(urlId) === false) return false;

  if (datasetUrl[urlId] === undefined) return false;

  return true;
};

const existsUserId = (userId, datasetUser) => {
  if (validUserId(userId) === false) return false;

  if (datasetUser[userId] === undefined) return false;

  return true;
};

const getUserByEmail = (email, datasetUser) => {
  let userData;
  if (validEmail === false) return userData;

  userData = Object.values(datasetUser)
    .find(userId => userId.email === email);
  
    return userData;
};

const loggedIn = (userId, datasetUser) => {
  if (validUserId(userId) === false) return false;

  if (datasetUser[userId] === undefined) return false;
  
  return true;
};

/**
 * Function that returns a random string of a specified length from a
 * given set of characters
 * @param {number} desiredLength - Total characters desired
 * @param {string} characterSet - The character set from which to
 * select random characters
 * @returns {string} A randomized string
 */
 const generateRandomString = (desiredLength = 0, characterSet) => {
  let randomString = '';
  if (desiredLength === 0) return randomString;
  const randomCharacter = characterSet[Math.floor(Math.random() * characterSet.length) + 0];
  randomString += randomCharacter + generateRandomString((desiredLength - 1), characterSet);
  return randomString;
};

const getUrlsByUserId = (userId, datasetUser, datasetUrl) => {
  if (existsUserId(userId, datasetUser) === false) return undefined;
  
  const urlData = {};
  Object.keys(datasetUrl).forEach(urlId => {
    if (datasetUrl[urlId].userId === userId) {
      const longUrl = datasetUrl[urlId].longUrl;
      datasetUrl[urlId] = { userId, longUrl };
    }
  });

  return urlData;
};

const getUserById = (userId, datasetUser) => {
  let userData;
  if (existsUserId(userId, datasetUser) === false) return userData;

  userData = datasetUser[userId];
  return userData;
};

const ownsUrlId = (urlId, userId, datasetUser, datasetUrl) => {
  if (existsUrlId(urlId, datasetUrl) === false || existsUserId(userId, datasetUser) === false) return false;
  
  if (datasetUrl[urlId].userId !== userId) return false;

  return true;
};

const validEmail = (email) => {
  if (typeof email !== 'string') return false;

  if (email === undefined) return false;

  if (email === '') return false;

  return true;
};

const validPassword = (password) => {
  if (typeof password !== 'string') return false;

  if (password === undefined) return false;

  if (password === '') return false;

  return true;
};

const validUrlId = (shortUrlId) => {
  if (typeof shortUrlId !== 'string') return false;

  if (shortUrlId === undefined) return false;

  if (shortUrlId === '') return false;

  return true;
};


const validUserId = (userId) => {
  if (typeof userId !== 'string') return false;

  if (userId === undefined) return false;

  if (userId === '') return false;

  return true;
};

module.exports = {
  authenticateUser,
  existsUrlId,
  existsUserId,
  getUserByEmail,
  loggedIn,
  getUrlsByUserId,
  getUserById,
  ownsUrlId,
  validEmail,
  validPassword,
  validUrlId,
  validUserId
}