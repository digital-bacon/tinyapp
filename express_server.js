const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const morgan = require("morgan");
const dbUrl = require('./data/url');
const dbUser = require('./data/user');
const {
  createUser,
  existsUrlId,
  getUserByEmail,
  loggedIn,
  generateUrlId,
  generateUserId,
  getUrlsByUserId,
  getUserById,
  ownsUrlId,
  validEmail,
  validPassword,
  validUrl,
} = require('./helpers');

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.static("public"));


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
    return res.status(404).send('404 - Not found');
  }

  const longUrl = dbUrl[urlId].longUrl;
  return res.redirect(longUrl);
});

app.get('/urls/new', (req, res) => {
  // Redirect if the user is not logged in
  const userId = req.session.userId;
  if (loggedIn(userId, dbUser) === false) {
    return res.redirect('/login');
  }

  const userData = getUserById(userId, dbUser);
  const templateVars = { userData };
  return res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const urlId = req.params.id;
  // Respond with a 404 if the requested ID does not exist
  if (existsUrlId(urlId, dbUrl) === false) {
    return res.status(404).send('404 - Not found');
  }

  const userId = req.session.userId;
  // Ensure user owns this urlId
  if (ownsUrlId(urlId, userId, dbUser, dbUrl) === false) {
    return res.status(403).send('403 - Forbidden. We could not authenticate you with the provided credentials.');
  }

  const longUrl = dbUrl[urlId].longUrl;
  const userData = getUserById(userId, dbUser);
  const templateVars = { userData, urlId, longUrl };
  return res.render('urls_show', templateVars);
});

app.get('/login', (req, res) => {
  // Redirect if the user is already logged in
  const userId = req.session.userId;
  if (loggedIn(userId, dbUser) === true) {
    return res.redirect('/urls');
  }

  const userData = getUserById(userId, dbUser);
  const templateVars = { userData };
  return res.render('login', templateVars);
});

app.get('/register', (req, res) => {
  // Redirect if the user is already logged in
  const userId = req.session.userId;
  if (loggedIn(userId, dbUser) === true) {
    return res.redirect('/urls');
  }

  const userData = getUserById(userId, dbUser);
  const templateVars = { userData };
  return res.render('register', templateVars);
});

app.get('/urls', (req, res) => {
  // TODO: abstract user auth check and redirect to helper function
  // Redirect if the user is not logged in
  const userId = req.session.userId;
  if (loggedIn(userId, dbUser) === false) {
    return res.redirect('/login');
  }

  const userData = getUserById(userId, dbUser);
  const urls = getUrlsByUserId(userId, dbUser, dbUrl);
  const templateVars = { userData, urls };
  return res.render('urls_index', templateVars);
});

app.get('/', (req, res) => {
  return res.redirect('/urls');
});

app.get('/*', (req, res) => {
  return res.status(404).send('404 - Not found');
});

/*
 * ROUTES FOR POST REQUESTS
 */
app.post('/urls/:id/update', (req, res) => {
  // Redirect if the user is not logged in
  const userId = req.session.userId;
  if (loggedIn(userId, dbUser) === false) {
    return res.redirect('/login');
  }

  const urlId = req.params.id;
  // Ensure the requested urlId exists
  if (existsUrlId(urlId, dbUrl) === false) {
    return res.status(404).send('404 - Not found');
  }

  // Ensure user owns this urlId
  if (ownsUrlId(urlId, userId, dbUser, dbUrl) === false) {
    return res.status(403).send('403 - Forbidden. We could not authenticate you with the provided credentials.');
  }

  const submittedUrl = req.body.longUrl;
  dbUrl[urlId].longUrl = submittedUrl;
  return res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  // Redirect if the user is not logged in
  const userId = req.session.userId;
  if (loggedIn(userId, dbUser) === false) {
    return res.redirect('/login');
  }

  const urlId = req.params.id;
  // Ensure the requested urlId exists
  if (existsUrlId(urlId, dbUrl) === false) {
    return res.status(404).send('404 - Not found');
  }

  // Ensure user owns this urlId
  if (ownsUrlId(urlId, userId, dbUser, dbUrl) === false) {
    return res.status(403).send('403 - Forbidden. We could not authenticate you with the provided credentials.');
  }

  delete dbUrl[urlId];
  return res.redirect('/urls');
});

app.post('/login', (req, res) => {
  // Redirect if the user is already logged in
  const userId = req.session.userId;
  if (loggedIn(userId, dbUser) === true) {
    return res.redirect('/urls');
  }

  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;
  // Don't allow a user to login if they didn't enter an email or password
  if (validEmail(submittedEmail) === false || validPassword(submittedPassword) === false) {
    return res.status(404).send('404 - Not found');
  }

  // Authenticate the user
  if (authenticateUser(submittedEmail, submittedPassword, dbUser) === false) {
    return res.status(403).send('403 - Forbidden. We could not authenticate you with the provided credentials.');
  }

  // User was authenticated, retrieve user data
  const userData = getUserByEmail(submittedEmail, dbUser);
  // Log the user in, then redirect
  req.session.userId = userData.id;
  return res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  return res.redirect('/login');
});

app.post('/register', (req, res) => {
  // Redirect if the user is already logged in
  const userId = req.session.userId;
  if (loggedIn(userId, dbUser) === true) {
    return res.redirect('/urls');
  }

  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;
  // Don't allow a user to register if they didn't enter an email or password
  if (validEmail(submittedEmail) === false || validPassword(submittedPassword) === false) {
    return res.status(404).send('404 - Not found');
  }
  
  // Don't allow a user to register if they already have an account
  if (getUserByEmail(submittedEmail, dbUser) !== undefined) {
    return res.status(404).send('404 - Not found');
  }
  
  // Hash the password
  const hashedPassword = bcrypt.hashSync(submittedPassword, 10);
  // Generate a random user id, then record this user in the dataset
  const newUserId = generateUserId();
  createUser(dbUser, newUserId, submittedEmail, hashedPassword)
  // Log the new user in, then redirect
  req.session.userId = newUserId;
  return res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  // Redirect if the user is not logged in
  const userId = req.session.userId;
  if (loggedIn(userId, dbUser) === false) {
    return res.redirect('/login');
  }

  const submittedUrl = req.body.longUrl;
  if (validUrl(submittedUrl) === false) {
    return res.status(400).send('400 - It seems you did not provide a valid url');
  };

  // Generate a new UrlId, then record this url in the dataset
  const newId = generateUrlId();
  // TODO: abstract url record creation to a helper function
  dbUrl[newId] = { userId, longUrl: submittedUrl };
  return res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});