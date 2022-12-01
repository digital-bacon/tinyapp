const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const morgan = require("morgan");
const dbUrl = require('./data/url');
const dbUser = require('./data/user');
const {
  createShortUrl,
  createUser,
  existsUrlId,
  filterUrls,
  filterUsers,
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
  keys: [
    '0MbFr6DEq2YyJpaQQhRfpQua5jQYpXa3vHLeMDET677s7TujQagyjoQZRb',
    '6nWCmHRRwz8yQkMTLwNsR5HrR2AdW09QLYDuCPs52VxXKbGG8fmmjWZgPCFafkAJCqHXXuoKYkPsHn',
    '3R51n4DqTiAkiGHpLmPfNqrNB0o6C1C2ec9m4iX'
  ],
  
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.static("public"));

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
  // Authorize user
  const userId = req.session.userId;
  const userData = filterUsers('id', userId, dbUser);
  if (userData[userId] === undefined) {
    return res.redirect('/login');
  }
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
  const userData = filterUsers('id', userId, dbUser);
  if (userData[userId] === undefined) {
    return res.redirect('/login');
  }

  // Ensure user owns this urlId
  if (ownsUrlId(urlId, userId, dbUser, dbUrl) === false) {
    return res.status(403).send('403 - Forbidden. We could not authenticate you with the provided credentials.');
  }

  const longUrl = dbUrl[urlId].longUrl;
  const templateVars = { userData, urlId, longUrl };
  return res.render('urls_show', templateVars);
});

app.get('/login', (req, res) => {
  return res.render('login', {});
});

app.get('/register', (req, res) => {
  // Authorize user, redirect if already logged in
  const userId = req.session.userId;
  const userData = filterUsers('id', userId, dbUser);
  if (userData[userId] !== undefined) {
    return res.redirect('/login');
  }

  return res.render('register', {});
});

app.get('/urls', (req, res) => {
  // Authorize user
  const userId = req.session.userId;
  const userData = filterUsers('id', userId, dbUser);
  if (userData[userId] === undefined) {
    return res.redirect('/login');
  }

  const urls = filterUrls('userId', userId, dbUrl);
  const templateVars = { urls, userData: userData[userId] };
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
  const userId = req.session.userId;
  if (filterUsers('id', userId, dbUser) === undefined) {
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
  // Authorize user
  const userId = req.session.userId;
  const userData = filterUsers('id', userId, dbUser);
  if (userData[userId] === undefined) {
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
  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;
  // Don't allow a user to login if they didn't enter an email or password
  if (validEmail(submittedEmail) === false || validPassword(submittedPassword) === false) {
    return res.status(404).send('404 - Not found');
  }
  
  const errMessage = '403 - Forbidden. We could not authenticate you with the provided credentials.';
  // Retrieve user record
  const userResults = filterUsers('email', submittedEmail, dbUser);
  const userId = Object.keys(userResults)[0];
  const userData = dbUser[userId];
  if (userData === undefined) {
    return res.status(403).send(errMessage);
  }

  const storedPassword = userData.password;
  const isAuthenticatedPassword = bcrypt.compareSync(submittedPassword, storedPassword);
  if (isAuthenticatedPassword === false) {
    return res.status(403).send(errMessage);
  }

  // User is authenticated
  req.session.userId = userData.id;
  return res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  return res.redirect('/login');
});

app.post('/register', (req, res) => {
  // Authorize user, redirect if already signed in
  const userId = req.session.userId;
  const userData = filterUsers('id', userId, dbUser);
  if (userData[userId] !== undefined) {
    return res.redirect('/urls');
  }

  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;
  // Don't allow a user to register if they didn't enter an email or password
  if (validEmail(submittedEmail) === false || validPassword(submittedPassword) === false) {
    return res.status(404).send('404 - Not found');
  }
  
  // Don't allow a user to register if they already have an account
  const foundAccount = filterUsers('email', submittedEmail, dbUser);
  if (Object.keys(foundAccount).length > 0) {
    return res.status(404).send('404 - Not found');
  }
  
  // Create a new user record
  const hashedPassword = bcrypt.hashSync(submittedPassword, 10);
  const newUser = createUser(dbUser, submittedEmail, hashedPassword);
  // Log the new user in, then redirect
  req.session.userId = newUser.id;
  return res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  // Authorize user
  const userId = req.session.userId;
  const userData = filterUsers('id', userId, dbUser);
  if (userData[userId] === undefined) {
    return res.redirect('/login');
  }

  const submittedUrl = req.body.longUrl;
  if (validUrl(submittedUrl) === false) {
    return res.status(400).send('400 - It seems you did not provide a valid url');
  };

  // Create a new short url record, then redirect to urls/
  createShortUrl(dbUrl, userId, submittedUrl);
  return res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}`);
});