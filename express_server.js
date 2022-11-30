const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const dbUrl = require('./data/url');
const dbUser = require('./data/user');
const {
  existsUrlId,
  getUserByEmail,
  loggedIn,
  generateRandomString,
  getUrlsByUserId,
  getUserById,
  ownsUrlId,
  validEmail,
  validPassword,
} = require('./helpers');

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


/*
 * ROUTES FOR GET REQUESTS
 */
app.get('/u/:id', (req, res) => {
  const urlId = req.params.id;
  if (existsUrlId(urlId, dbUrl) === false) {
    res.status(404).send('404 - Not found');
  }

  const longUrl = dbUrl[urlId].longUrl;
  res.redirect(longUrl);
});

app.get('/urls/new', (req, res) => {
  // Redirect if the user is not logged in
  const userId = req.session.userId;
  if (loggedIn(userId, dbUser) === false) {
    res.redirect('/login');
  }

  const userData = getUserById(userId, dbUser);
  const templateVars = { userData };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const urlId = req.params.id;
  // Respond with a 404 if the requested ID does not exist
  if (existsUrlId(urlId, dbUrl) === false) {
    res.status(404).send('404 - Not found');
  }

  const userId = req.session.userId;
  // Ensure user owns this urlId
  if (ownsUrlId(urlId, userId, dbUser, dbUrl) === false) {
    res.status(403).send('403 - Forbidden. We could not authenticate you with the provided credentials.');
  }

  const longUrl = dbUrl[urlId].longUrl;
  const userData = getUserById(userId, dbUser);
  const templateVars = { userData, urlId, longUrl };
  res.render('urls_show', templateVars);
});

app.get('/login', (req, res) => {
  // Redirect if the user is already logged in
  const userId = req.session.userId;
  if (loggedIn(userId, dbUser) === true) {
    res.redirect('/urls');
  }

  const userData = getUserById(userId, dbUser);
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
  if (loggedIn(userId, dbUser) === true) {
    res.redirect('/urls');
  }

  const userData = getUserById(userId, dbUser);
  const templateVars = { userData };
  res.render('register', templateVars);
});

app.get('/urls', (req, res) => {
  // Redirect if the user is not logged in
  const userId = req.session.userId;
  if (loggedIn(userId, dbUser) === false) {
    res.redirect('/login');
  }

  const userData = getUserById(userId, dbUser);
  const urls = getUrlsByUserId(userId, dbUser, dbUrl);
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
  if (loggedIn(userId, dbUser) === false) {
    res.redirect('/login');
  }

  const urlId = req.params.id;
  // Ensure the requested urlId exists
  if (existsUrlId(urlId, dbUrl) === false) {
    res.status(404).send('404 - Not found');
  }

  // Ensure user owns this urlId
  if (ownsUrlId(urlId, userId, dbUser, dbUrl) === false) {
    res.status(403).send('403 - Forbidden. We could not authenticate you with the provided credentials.');
  }

  const submittedUrl = req.body.longUrl;
  dbUrl[urlId].longUrl = submittedUrl;
  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  // Redirect if the user is not logged in
  const userId = req.session.userId;
  if (loggedIn(userId, dbUser) === false) {
    res.redirect('/login');
  }

  const urlId = req.params.id;
  // Ensure the requested urlId exists
  if (existsUrlId(urlId, dbUrl) === false) {
    res.status(404).send('404 - Not found');
  }

  // Ensure user owns this urlId
  if (ownsUrlId(urlId, userId, dbUser, dbUrl) === false) {
    res.status(403).send('403 - Forbidden. We could not authenticate you with the provided credentials.');
  }

  delete dbUrl[urlId];
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  // Redirect if the user is already logged in
  const userId = req.session.userId;
  if (loggedIn(userId, dbUser) === true) {
    res.redirect('/urls');
  }

  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;
  // Don't allow a user to login if they didn't enter an email or password
  if (validEmail(submittedEmail) === false || validPassword(submittedPassword) === false) {
    res.status(404).send('404 - Not found');
  }

  // Authenticate the user
  if (authenticateUser(submittedEmail, submittedPassword, dbUser) === false) {
    res.status(403).send('403 - Forbidden. We could not authenticate you with the provided credentials.');
  }

  // User was authenticated, retrieve user data
  const userData = getUserByEmail(submittedEmail, dbUser);
  // Log the user in, then redirect
  req.session.userId = userData.id;
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  // Redirect if the user is already logged in
  const userId = req.session.userId;
  if (loggedIn(userId, dbUser) === true) {
    res.redirect('/urls');
  }

  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;
  // Don't allow a user to register if they didn't enter an email or password
  if (validEmail(submittedEmail) === false || validPassword(submittedPassword) === false) {
    res.status(404).send('404 - Not found');
  }
  
  // Don't allow a user to register if they already have an account
  if (getUserByEmail(submittedEmail, dbUser) !== undefined) {
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
  dbUser[newUserId] = {
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
  if (loggedIn(userId, dbUser) === false) {
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
  dbUrl[newId] = { userId, longUrl: submittedUrl };
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});