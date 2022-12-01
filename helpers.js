const createShortUrl = (datasetUrl, userId, longUrl) => {
  const newUrlId = generateUrlId();
  datasetUrl[newUrlId] = { userId, longUrl };
  return datasetUrl[newUrlId];
}

const createUser = (datasetUser, email, password) => {
  const id = generateUserId();
  datasetUser[id] = { id, email, password };
  return datasetUser[id];
}

const existsUrlId = (urlId, datasetUrl) => {
  if (validUrlId(urlId) === false) return false;

  if (datasetUrl[urlId] === undefined) return false;

  return true;
};

const existsUserId = (userId, datasetUser) => {
  if (typeof userId !== 'string') return false;
  if (userId === '') return false;
  if (datasetUser[userId] === undefined) return false;
  return false;
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

const generateUrlId = () => {
  const characterSets = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
  };
  
  const useCharacters = Object.values(characterSets).join('');
  const newId = generateRandomString(6, useCharacters);
  return newId;
}

const generateUserId = () => {
  const characterSets = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
  };

  const useCharacters = Object.values(characterSets).join('');
  const newUserId = generateRandomString(5, useCharacters);
  return newUserId;
}

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

const getUrlsByUserId = (userId, datasetUrl) => {
  const urlData = {};
  Object.keys(datasetUrl).forEach(urlId => {
    if (datasetUrl[urlId].userId === userId) {
      urlData[urlId] = {
        userId,
        longUrl: datasetUrl[urlId].longUrl,
      };
    }
  });

  return urlData;
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
        email: datasetUrl[urlId].longUrl,
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

const ownsUrlId = (urlId, userId, datasetUser, datasetUrl) => {
  if (typeof urlId !== 'string') return false;
  if (typeof userId !== 'string') return false;
  if (urlId === '') return false;
  if (userId === '') return false;
  if (datasetUrl[urlId] === undefined) return false;
  if (datasetUser[userId] === undefined) return false;  
  if (datasetUrl[urlId].userId !== userId) return false;
  return true;
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

const validUrlId = (shortUrlId) => {
  if (typeof shortUrlId !== 'string') return false;

  if (shortUrlId === '') return false;

  return true;
};

const validUrl = (url) => {
  if (typeof url !== 'string') return false;

  if (url === '') return false;

  return true;
};

const validUserId = (userId) => {
  if (typeof userId !== 'string') return false;

  if (userId === '') return false;

  return true;
};

module.exports = {
  createShortUrl,
  createUser,
  existsUrlId,
  filterUrls,
  filterUsers,
  ownsUrlId,
  validEmail,
  validPassword,
  validUrl,
};