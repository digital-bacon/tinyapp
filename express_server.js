const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

const existsShortUrlID = (shortUrlId) => {
  if (typeof shortUrlId === 'undefined') return false;
  if (shortUrlId === '') return false;
  if (urlDatabase[shortUrlId] !== undefined) return true;
  return false;
};

const loggedIn = (userId) => {
  if (validUserId(userId) === false) return false;
  if (users[userId] === undefined) return false;
  return true;
};

const authenticateUser = (email, password) => {
  if (validEmail(email) === false || validEmail(password) === false) return false;
  const userObject = Object.values(users)
    .find(userId => userId.email === email && userId.password === password);
  const isauthenticateUser = userObject !== undefined;
  return isauthenticateUser;
};

const getUserById = (userId) => {
  let userData;
  if (validUserId(userId) === false) return userData;
  if (users[userId] === undefined) return userData;
  userData = users[userId];
  return userData;
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
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

/*
 * ROUTES FOR GET REQUESTS
 */
app.get('/u/:id', (req, res) => {
  const urlId = req.params.id;
  if (existsShortUrlID(urlId) === false) {
    res.status(404).send('404 - Not found');
  }
  const longUrl = urlDatabase[urlId].longUrl;
  res.redirect(longUrl);
});

app.get('/urls/new', (req, res) => {
  // Redirect if the user is not logged in
  const userId = req.cookies['user_id'];
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
  if (existsShortUrlID(urlId) === false) {
    res.status(404).send('404 - Not found');
  }
  const longUrl = urlDatabase[urlId].longUrl;
  const userId = req.cookies['user_id'];
  const userData = getUserById(userId);
  const templateVars = { userData, urlId, longUrl };
  res.render('urls_show', templateVars);
});

app.get('/login', (req, res) => {
  // Redirect if the user is already logged in
  const userId = req.cookies['user_id'];
  if (loggedIn(userId) === true) {
    res.redirect('/urls');
  }
  const userData = getUserById(userId);
  const templateVars = { userData };
  res.render('login', templateVars);
});

app.get('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.get('/register', (req, res) => {
  // Redirect if the user is already logged in
  const userId = req.cookies['user_id'];
  if (loggedIn(userId) === true) {
    res.redirect('/urls');
  }
  const userData = getUserById(userId);
  const templateVars = { userData };
  res.render('register', templateVars);
});

app.get('/urls', (req, res) => {
  // Redirect if the user is not logged in
  const userId = req.cookies['user_id'];
  if (loggedIn(userId) === false) {
    res.redirect('/login');
  }
  const userData = getUserById(userId);
  const urls = urlDatabase;
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
  const userId = req.cookies['user_id'];
  if (loggedIn(userId) === false) {
    res.redirect('/login');
  }
  const urlId = req.params.id;
  if (existsShortUrlID(urlId) === false) {
    res.status(404).send('404 - Not found');
  }
  const submittedUrl = req.body.longUrl;
  urlDatabase[urlId].longUrl = submittedUrl;
  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  // Redirect if the user is not logged in
  const userId = req.cookies['user_id'];
  if (loggedIn(userId) === false) {
    res.redirect('/login');
  }
  const urlId = req.params.id;
  if (existsShortUrlID(urlId) === false) {
    res.status(404).send('404 - Not found');
  }
  delete urlDatabase[urlId];
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  // Redirect if the user is already logged in
  const userId = req.cookies['user_id'];
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
  // User was authenticateUser, retrieve user data
  const userData = getUserByEmail(submittedEmail);
  // Log the user in, then redirect
  res.cookie('user_id', userData.id);
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  // Redirect if the user is already logged in
  const userId = req.cookies['user_id'];
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
    password: submittedPassword
  };
  // Log the new user in, then redirect
  res.cookie('user_id', newUserId);
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  // Redirect if the user is not logged in
  const userId = req.cookies['user_id'];
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