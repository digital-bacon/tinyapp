const express = require('express');
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

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

// const validURL = (url) => {
//   if (typeof url !== 'string') return false;
//   if (url.length === 0) return false;
//   const lowerCaseURL = url.toLowerCase();
//   if (lowerCaseURL.slice(6) !== 'http://' && lowerCaseURL !== 'https') return false;
// };

const existsShortURLID = (id) => {
  if (typeof id === 'undefined') return false;
  if (id === '') return false;
  if (urlDatabase[id] !== undefined) return true;
  return false;
}

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

/*
 * ROUTES FOR GET REQUESTS
 */

app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  // Respond with a 404 if the requested ID does not exist
  if (existsShortURLID(id) === false) {
    res.status(404).send('404 - Not found');
  }
  const longURL = urlDatabase[id];
  const username = req.cookies['username'];
  const templateVars = { id, longURL, username };
  res.render('urls_show', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const username = req.cookies['username'];
  const templateVars = { username, urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (get, res) => {
  res.json(urlDatabase);
});

app.get('/*', (req, res) => {
  res.status(404).send('404 - Not found');
});

/*
 * ROUTES FOR POST REQUESTS
 */
app.post('/urls/:id/update', (req, res) => {
  const id = req.params.id;
  if (existsShortURLID(id)) {
    const submittedURL = req.body.longURL;
    urlDatabase[id] = submittedURL;
  }
  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  if (existsShortURLID(id)) {
    delete urlDatabase[id];
  }
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  // TODO: Validate submitted URL as a URL, handle response if invalid
  const submittedURL = req.body.longURL;
  // const isValidURL = (validURL(submittedURL));
  const characterSets = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
  };
  const useCharacters = Object.values(characterSets).join('');
  const newId = generateRandomString(6, useCharacters);
  urlDatabase[newId] = submittedURL;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  // TODO: Check if user is already logged-in
  const submittedUsername = req.body.username;
  res.cookie('username', submittedUsername);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});