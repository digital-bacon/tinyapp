const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const morgan = require("morgan");
const dbUrl = require('../data/url');
const dbUser = require('../data/user');
const {
  createShortUrl,
  createUser,
  filterUrls,
  filterUsers,
  validEmail,
  validPassword,
  validUrl,
} = require('./helpers');

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

/*
 * MIDDLEWARE
 */
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.static("public"));
app.use(cookieSession({
  name: 'session',
  keys: [
    '0MbFr6DEq2YyJpaQQhRfpQua5jQYpXa3vHLeMDET677s7TujQagyjoQZRb',
    '6nWCmHRRwz8yQkMTLwNsR5HrR2AdW09QLYDuCPs52VxXKbGG8fmmjWZgPCFafkAJCqHXXuoKYkPsHn',
    '3R51n4DqTiAkiGHpLmPfNqrNB0o6C1C2ec9m4iX',
    'oRJWd6TkHph39rP3fzADVm8PsjctrzpU6zUfFZJ8Gn0KBiLACV3jTKZ2RAyWsf5Y',
    'Us0EQWB0HCm6djvHCHMEB7TUz3FDNENUnPurTNHdj7THC67jmhJteZyf2nyg1WwZXVGhEPQFY6g6xXxXZcot2JXaFRC'
  ],
  
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const authorize = (req, res, next) => {
  const userId = req.session.userId;
  if (userId === undefined) {
    return res.redirect('/login');
  }

  const userData = filterUsers('id', userId, dbUser);
  if (userData[userId] === undefined) {
    return res.redirect('/login');
  }
  
  next();
};

const urlMustExist = (req, res, next) => {
  const urlId = req.params.id;
  // Ensure the requested urlId exists
  const urlData = dbUrl[urlId];
  if (urlData === undefined) {
    return res.status(404).send('404 - Not found');
  }
  
  next();
};

const userMustOwnUrl = (req, res, next) => {
  const userId = req.session.userId;
  const urlId = req.params.id;
  // Ensure user owns this urlId
  const urlData = dbUrl[urlId];
  if (urlData.userId !== userId) {
    return res.status(403).send('403 - Forbidden. You are not authorized to make that request.');
  }
  
  next();
};

/*
 * ROUTES FOR GET REQUESTS
 */
app.get('/login', (req, res) => {
  // Redirect if already logged in
  const userId = req.session.userId;
  const userData = dbUser[userId];
  if (userData !== undefined) {
    return res.redirect('/urls');
  }
  return res.render('login', {});
});

app.get('/register', (req, res) => {
  // Authorize user, redirect if already logged in
  const userId = req.session.userId;
  const userData = filterUsers('id', userId, dbUser);
  if (userData[userId] !== undefined) {
    return res.redirect('/urls');
  }

  return res.render('register', {});
});

app.get('/urls/new', authorize, (req, res) => {
  const userId = req.session.userId;
  const userData = dbUser[userId];
  const templateVars = { userData };
  return res.render('urls_new', templateVars);
});

app.get('/urls', authorize, (req, res) => {
  const userId = req.session.userId;
  const userData = dbUser[userId];
  const urls = filterUrls('userId', userId, dbUrl);
  const templateVars = { urls, userData };
  return res.render('urls_index', templateVars);
});

app.get('/urls/:id', authorize, urlMustExist, userMustOwnUrl, (req, res) => {
  const userId = req.session.userId;
  const userData = dbUser[userId];
  const urlId = req.params.id;
  const longUrl = dbUrl[req.params.id].longUrl;
  const templateVars = { userData, urlId, longUrl };
  return res.render('urls_show', templateVars);
});

app.get('/u/:id', (req, res) => {
  const longUrl = dbUrl[req.params.id].longUrl;
  return res.redirect(longUrl);
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
app.post('/login', (req, res) => {
  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;
  // Don't allow a user to login if they didn't enter an email or password
  if (validEmail(submittedEmail) === false || validPassword(submittedPassword) === false) {
    return res.status(400).send('400 - Bad request. It seems you did not provide a valid email and/or password');
  }
  
  // Retrieve user record
  const userResults = filterUsers('email', submittedEmail, dbUser);
  const userId = Object.keys(userResults)[0];
  const userData = dbUser[userId];
  if (userData === undefined) {
    return res.status(403).send('401 - Unauthorized. We could not authenticate you with the provided credentials.');
  }

  const storedPassword = userData.password;
  const isAuthenticatedPassword = bcrypt.compareSync(submittedPassword, storedPassword);
  if (isAuthenticatedPassword === false) {
    return res.status(403).send('401 - Unauthorized. We could not authenticate you with the provided credentials.');
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
  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;
  // Don't allow a user to register if they didn't enter a valid email or password
  if (validEmail(submittedEmail) === false || validPassword(submittedPassword) === false) {
    return res.status(400).send('400 - Bad request. It seems you did not provide a valid email and/or password');
  }
  
  // Don't allow a user to register if they already have an account
  const foundAccount = filterUsers('email', submittedEmail, dbUser);
  if (Object.keys(foundAccount).length > 0) {
    return res.status(400).send('400 - Bad request.');
  }
  
  // Create a new user record
  const hashedPassword = bcrypt.hashSync(submittedPassword, 10);
  const newUserId = createUser(dbUser, submittedEmail, hashedPassword);
  // If a new user was not created, return a server error
  if (dbUser[newUserId] === undefined) {
    return res.status(500).send('500 - Internal Server Error');
  }

  // Log the new user in, then redirect
  req.session.userId = newUserId;
  return res.redirect('/urls');
});

app.post('/urls', authorize, (req, res) => {
  const userId = req.session.userId;
  const submittedUrl = req.body.longUrl;
  if (validUrl(submittedUrl) === false) {
    return res.status(400).send('400 - It seems you did not provide a valid url');
  }

  // Create a new short url record, and return the id
  const newUrlId = createShortUrl(dbUrl, userId, submittedUrl);
  // If a new short Url was not created, return a server error
  if (dbUrl[newUrlId] === undefined) {
    return res.status(500).send('500 - Internal Server Error');
  }

  return res.redirect(`/urls/${newUrlId}`);
});

app.post('/urls/:id/update', authorize, urlMustExist, userMustOwnUrl, (req, res) => {
  const submittedUrl = req.body.longUrl;
  if (validUrl(submittedUrl) === false) {
    return res.status(400).send('400 - It seems you did not provide a valid url');
  }
  const urlId = req.params.id;
  dbUrl[urlId].longUrl = submittedUrl;
  return res.redirect('/urls');
});

app.post('/urls/:id/delete', authorize, urlMustExist, userMustOwnUrl, (req, res) => {
  const urlId = req.params.id;
  delete dbUrl[urlId];
  return res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}`);
});