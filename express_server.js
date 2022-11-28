const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

/**
 * Function that returns a random string of a specified length from a
 * given set of characters
 * @param {number} desiredLength - Total characters desired
 * @returns {string} A randomized string
 */
const generateRandomString = (desiredLength = 0, characterSet) => {
   let randomString = '';
   if (desiredLength === 0) return randomString;
   const randomCharacter = characters[Math.floor(Math.random() * characterSet.length) + 0];
   randomString += randomCharacter + generateRandomString((desiredLength - 1));
   return randomString;
};

// const characterSets = {
//   lowercase: 'abcdefghijklmnopqrstuvwxyz',
//   uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
//   numbers: '0123456789',
// };
// let characters = '';
// characters += characterSets.lowercase;
// characters += characterSets.uppercase;
// characters += characterSets.numbers;

// generateRandomString(6, characters);

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

app.use(express.urlencoded({ extended: true }));

app.post('/urls', (req, res) => {
  console.log(req.body);
  res.send("OK");
})

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/urls_new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id, longURL };
  res.render('urls_show', templateVars);
});

app.get('/urls.json', (get, res) => {
  res.json(urlDatabase);
});

app.get('/*', (req, res) => {
  res.status(404).send('404 - Not found');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});