/**
 * Function that adds a new tiny url record for a given user and url
 * and returns the tiny url shortcode when successful
 * @param {Object} datasetUrl - The dataset to add the record to
 * @param {string} userId - The owner of the record
 * @param {string} longUrl - The long form url that users will be
 * redirected to if they request this tiny url
 * @returns {string | undefined} The tiny url code
 */
const createTinyUrl = (datasetUrl, userId, longUrl) => {
  if (validUrl(longUrl) === false) return;
  if (typeof userId !== 'string') return;
  if (userId === '') return;
  if (typeof datasetUrl !== 'object' || Array.isArray(datasetUrl)) return;
  const newUrlId = generateUrlShortcode();
  datasetUrl[newUrlId] = {
    userId,
    longUrl
  };
  return newUrlId;
};

/**
 * Function that adds a new user record for a user when provided
 * with an email address and hashed password. Returns the new user id
 * when successful.
 * @param {Object} datasetUser - The dataset to add the record to
 * @param {string} email - The user's email address
 * @param {string} password - The hashed password for this user
 * @returns {string | undefined} The new user id
 */
const createUser = (datasetUser, email, password) => {
  if (validEmail === false || validPassword === false) return;
  if (typeof datasetUser !== 'object' || Array.isArray(datasetUser)) return;
  const id = generateUserId();
  if (datasetUser[id] !== undefined) return;
  datasetUser[id] = {
    id,
    email,
    password
  };
  return id;
};

/**
 * Function that generates a random url identifier code
 * @returns {string} The new url identifier code
 */
const generateUrlShortcode = () => {
  const characterSets = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
  };
  
  const useCharacters = Object.values(characterSets).join('');
  const newId = generateRandomString(6, useCharacters);
  return newId;
};

/**
 * Function that generates a random user identifier code
 * @returns {string} The new user identifier code
 */
const generateUserId = () => {
  const characterSets = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
  };

  const useCharacters = Object.values(characterSets).join('');
  const newUserId = generateRandomString(5, useCharacters);
  return newUserId;
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

/**
 * Function that filters a given url dataset for a single key and value
 * @param {string} key - The property key to match
 * @param {string} value - The property value to match
 * @param {Object} datasetUrl - The dataset from which to look
 * @returns {Object} The filtered results
 */
const filterUrls = (key, value, datasetUrl) => {
  const urlData = {};
  if (typeof key !== 'string') return urlData;
  if (key === '') return urlData;
  if (typeof datasetUrl !== 'object') return urlData;
  Object.keys(datasetUrl).forEach(urlId => {
    if (datasetUrl[urlId][key] === value) {
      urlData[urlId] = {
        userId: datasetUrl[urlId].userId,
        longUrl: datasetUrl[urlId].longUrl,
      };
    }
  });
  return urlData;
};

/**
 * Function that filters a given user dataset for a single key and value
 * @param {string} key - The property key to match
 * @param {string} value - The property value to match
 * @param {Object} datasetUser - The dataset from which to look
 * @returns {Object} The filtered results
 */
const filterUsers = (key, value, datasetUser) => {
  const userData = {};
  if (typeof key !== 'string') return userData;
  if (key === '') return userData;
  if (typeof datasetUser !== 'object') return userData;
  Object.keys(datasetUser).forEach(userId => {
    if (datasetUser[userId][key] === value) {
      userData[userId] = {
        id: datasetUser[userId].id,
        email: datasetUser[userId].email,
        password: datasetUser[userId].password,
      };
    }
  });
  return userData;
};

/**
 * Function that validates a given email as an email address
 * @param {string} email - The email to evaluate
 * @returns {boolean} When valid, returns true
 */
const validEmail = (email) => {
  if (typeof email !== 'string') return false;
  if (email === '') return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (regex.test(email) === false) return false;
  return true;
};

/**
 * Function that validates a given plaintext password
 * @param {string} password - The plaintext password to evaluate
 * @returns {boolean} When valid, returns true
 */
const validPassword = (password) => {
  if (typeof password !== 'string') return false;
  if (password === '') return false;
  return true;
};

/**
 * Function that validates a given url
 * @param {string} password - The plaintext password to evaluate
 * @returns {boolean} When valid, returns true
 */
const validUrl = (url) => {
  // TODO: Use regex to ensure the url includes http(s)://
  if (typeof url !== 'string') return false;
  if (url === '') return false;
  return true;
};

module.exports = {
  createTinyUrl,
  createUser,
  filterUrls,
  filterUsers,
  validEmail,
  validPassword,
  validUrl,
};