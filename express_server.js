const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

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

// const validUrl = (url) => {
//   if (typeof url !== 'string') return false;
//   if (url.length === 0) return false;
//   const lowerCaseUrl = url.toLowerCase();
//   if (lowerCaseUrl.slice(6) !== 'http://' && lowerCaseUrl !== 'https') return false;
// };

const existsUrlId = (urlId) => {
  if (validUrlId(urlId) === false) return false;

  if (urlDatabase[urlId] === undefined) return false;

  return true;
};

const existsUserId = (userId) => {
  if (validUserId(userId) === false) return false;

  if (users[userId] === undefined) return false;

  return true;
};

const ownsUrlId = (urlId, userId) => {
  if (existsUrlId(urlId) === false || existsUserId(userId) === false) return false;
  
  if (urlDatabase[urlId].userId !== userId) return false;

  return true;
};

const loggedIn = (userId) => {
  if (validUserId(userId) === false) return false;

  if (users[userId] === undefined) return false;
  
  return true;
};

const authenticateUser = (email, password) => {
  if (validEmail(email) === false || validEmail(password) === false) return false;

  // Find a user record that matches the provided email and password
  const userObject = Object.values(users)
    .find(userId => userId.email === email &&
      bcrypt.compareSync(password, userId.password)
    );
  
  // If a user was found, then this user is authenticated
  const isauthenticateUser = userObject !== undefined;
  return isauthenticateUser;
};

const getUserById = (userId) => {
  let userData;
  if (existsUserId(userId) === false) return userData;

  userData = users[userId];
  return userData;
};

const getUrlsByUserId = (userId) => {
  if (existsUserId(userId) === false) return undefined;
  
  const urlData = {};
  Object.keys(urlDatabase).forEach(urlId => {
    if (urlDatabase[urlId].userId === userId) {
      const longUrl = urlDatabase[urlId].longUrl;
      urlData[urlId] = { userId, longUrl };
    }
  });

  return urlData;
};

const getUserByEmail = (email) => {
  let userData;
  if (validEmail === false) return userData;

  userData = Object.values(users)
    .find(userId => userId.email === email);

  return userData;
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

const validUserId = (userId) => {
  if (typeof userId !== 'string') return false;

  if (userId === undefined) return false;

  if (userId === '') return false;

  return true;
};

const validUrlId = (shortUrlId) => {
  if (typeof shortUrlId !== 'string') return false;

  if (shortUrlId === undefined) return false;

  if (shortUrlId === '') return false;

  return true;
};

const urlDatabase = {
  'b2xVn2': {
    userId: 'user2RandomID',
    longUrl: 'http://www.lighthouselabs.ca',
  },

  '9sm5xK': {
    userId: 'user2RandomID',
    longUrl: 'http://www.google.com',
  },

};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$wLb8tOmKKnVjvcNddhK04uD6NbDsS8ZMY4txGu7t462mK4sdaZDVC",
  },

  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$uLfto/h81xiPJWcXYRct4uuzz5O51AAXVmGZwP4YQu.aVjsalvfuu",
  },

};

/*
 * ROUTES FOR GET REQUESTS
 */
app.get('/u/:id', (req, res) => {
  const urlId = req.params.id;
  if (existsUrlId(urlId) === false) {
    res.status(404).send('404 - Not found');
  }

  const longUrl = urlDatabase[urlId].longUrl;
  res.redirect(longUrl);
});

app.get('/urls/new', (req, res) => {
  // Redirect if the user is not logged in
  const userId = req.session.userId;
  if (loggedIn(userId) === false) {
    res.redirect('/login');
  }

  const userData = getUserById(userId);
  const templateVars = { userData };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const urlId = req.params.id;
  // Respond with a 404 if the requested ID does not exist
  if (existsUrlId(urlId) === false) {
    res.status(404).send('404 - Not found');
  }

  const userId = req.session.userId;
  // Ensure user owns this urlId
  if (ownsUrlId(urlId, userId) === false) {
    res.status(403).send('403 - Forbidden. We could not authenticate you with the provided credentials.');
  }

  const longUrl = urlDatabase[urlId].longUrl;
  const userData = getUserById(userId);
  const templateVars = { userData, urlId, longUrl };
  res.render('urls_show', templateVars);
});

app.get('/login', (req, res) => {
  // Redirect if the user is already logged in
  const userId = req.session.userId;
  if (loggedIn(userId) === true) {
    res.redirect('/urls');
  }

  const userData = getUserById(userId);
  const templateVars = { userData };
  res.render('login', templateVars);
});

app.get('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.get('/register', (req, res) => {
  // Redirect if the user is already logged in
  const userId = req.session.userId;
  if (loggedIn(userId) === true) {
    res.redirect('/urls');
  }

  const userData = getUserById(userId);
  const templateVars = { userData };
  res.render('register', templateVars);
});

app.get('/urls', (req, res) => {
  // Redirect if the user is not logged in
  const userId = req.session.userId;
  if (loggedIn(userId) === false) {
    res.redirect('/login');
  }

  const userData = getUserById(userId);
  const urls = getUrlsByUserId(userId);
  const templateVars = { userData, urls };
  res.render('urls_index', templateVars);
});

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/*', (req, res) => {
  res.status(404).send('404 - Not found');
});

/*
 * ROUTES FOR POST REQUESTS
 */
app.post('/urls/:id/update', (req, res) => {
  // Redirect if the user is not logged in
  const userId = req.session.userId;
  if (loggedIn(userId) === false) {
    res.redirect('/login');
  }

  const urlId = req.params.id;
  // Ensure the requested urlId exists
  if (existsUrlId(urlId) === false) {
    res.status(404).send('404 - Not found');
  }

  // Ensure user owns this urlId
  if (ownsUrlId(urlId, userId) === false) {
    res.status(403).send('403 - Forbidden. We could not authenticate you with the provided credentials.');
  }

  const submittedUrl = req.body.longUrl;
  urlDatabase[urlId].longUrl = submittedUrl;
  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  // Redirect if the user is not logged in
  const userId = req.session.userId;
  if (loggedIn(userId) === false) {
    res.redirect('/login');
  }

  const urlId = req.params.id;
  // Ensure the requested urlId exists
  if (existsUrlId(urlId) === false) {
    res.status(404).send('404 - Not found');
  }

  // Ensure user owns this urlId
  if (ownsUrlId(urlId, userId) === false) {
    res.status(403).send('403 - Forbidden. We could not authenticate you with the provided credentials.');
  }

  delete urlDatabase[urlId];
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  // Redirect if the user is already logged in
  const userId = req.session.userId;
  if (loggedIn(userId) === true) {
    res.redirect('/urls');
  }

  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;
  // Don't allow a user to login if they didn't enter an email or password
  if (validEmail(submittedEmail) === false || validPassword(submittedPassword) === false) {
    res.status(404).send('404 - Not found');
  }

  // Authenticate the user
  if (authenticateUser(submittedEmail, submittedPassword) === false) {
    res.status(403).send('403 - Forbidden. We could not authenticate you with the provided credentials.');
  }

  // User was authenticated, retrieve user data
  const userData = getUserByEmail(submittedEmail);
  // Log the user in, then redirect
  req.session.userId = userData.id;
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  // Redirect if the user is already logged in
  const userId = req.session.userId;
  if (loggedIn(userId) === true) {
    res.redirect('/urls');
  }

  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;
  // Don't allow a user to register if they didn't enter an email or password
  if (validEmail(submittedEmail) === false || validPassword(submittedPassword) === false) {
    res.status(404).send('404 - Not found');
  }
  
  // Don't allow a user to register if they already have an account
  if (getUserByEmail(submittedEmail) !== undefined) {
    res.status(404).send('404 - Not found');
  }
  
  // Hash the password
  const hashedPassword = bcrypt.hashSync(submittedPassword, 10);
  // Generate a random user id
  const characterSets = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
  };

  const useCharacters = Object.values(characterSets).join('');
  const newUserId = generateRandomString(5, useCharacters);
  users[newUserId] = {
    id: newUserId,
    email: submittedEmail,
    password: hashedPassword,
  };

  // Log the new user in, then redirect
  req.session.userId = newUserId;
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  // Redirect if the user is not logged in
  const userId = req.session.userId;
  if (loggedIn(userId) === false) {
    res.redirect('/login');
  }

  // TODO: Validate submitted Url as a Url, handle response if invalid
  const submittedUrl = req.body.longUrl;
  // const isValidUrl = (validUrl(submittedUrl));
  const characterSets = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
  };
  
  const useCharacters = Object.values(characterSets).join('');
  const newId = generateRandomString(6, useCharacters);
  urlDatabase[newId] = submittedUrl;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});