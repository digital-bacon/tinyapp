const createShortUrl = (datasetUrl, userId, longUrl) => {
  if (typeof userId !== 'string') return;
  if (typeof longUrl !== 'string') return;
  if (userId === '') return false;
  if (longUrl === '') return false;
  if (typeof datasetUrl !== 'object') return;
  const newUrlId = generateUrlId();
  datasetUrl[newUrlId] = { userId, longUrl };
  return datasetUrl[newUrlId];
};

const createUser = (datasetUser, email, password) => {
  if (typeof email !== 'string') return;
  if (typeof password !== 'string') return;
  if (email === '') return false;
  if (password === '') return false;
  if (typeof datasetUser !== 'object') return;
  const id = generateUserId();
  if (datasetUser[id] !== undefined) return;
  datasetUser[id] = { id, email, password };
  return datasetUser[id];
};

const generateUrlId = () => {
  const characterSets = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
  };
  
  const useCharacters = Object.values(characterSets).join('');
  const newId = generateRandomString(6, useCharacters);
  return newId;
};

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

const validEmail = (email) => {
  if (typeof email !== 'string') return false;
  if (email === '') return false;
  return true;
};

const validPassword = (password) => {
  if (typeof password !== 'string') return false;
  if (password === '') return false;
  return true;
};

const validUrl = (url) => {
  if (typeof url !== 'string') return false;
  if (url === '') return false;
  return true;
};

module.exports = {
  createShortUrl,
  createUser,
  filterUrls,
  filterUsers,
  validEmail,
  validPassword,
  validUrl,
};