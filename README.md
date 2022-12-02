# TinyApp

A URL shortener built on Express with Node and JavaScript.


## Disclaimer

This app was built for educational purposes only. Do not use this app in any production environment or provide any sensitive information while using this app. The security and privacy of information you provide is **not** guaranteed.


## Purpose

This project was created and published by me as part of my learnings at Lighthouse Labs. 


## Usage

**Install dependencies:**

`npm install`

**Start the server:**

`npm start`

**Open the app in your web browser:**

http://localhost:8080/(http://localhost:8080/)

**Stop the server:**

`CTRL^C` in your terminal


## Dependencies

* [bcrypt.js](https://github.com/dcodeIO/bcrypt.js) - Optimized bcrypt in JavaScript with zero dependencies.
* [cookie-session](https://github.com/expressjs/cookie-session) - Simple cookie-based session middleware.
* [express](https://github.com/expressjs/express) - Fast, unopinionated, minimalist web framework for Node.js.
* [jsdoc2md](https://github.com/jsdoc2md) - Generates markdown from js-doc annotated sources.
* [morgan](https://github.com/expressjs/morgan) - HTTP request logger middleware for node.js.


## Functions

<dl>
<dt><a href="#createTinyUrl">createTinyUrl(datasetUrl, userId, longUrl)</a> ⇒ <code>string</code> | <code>undefined</code></dt>
<dd><p>Function that adds a new tiny url record for a given user and url
and returns the tiny url shortcode when successful</p>
</dd>
<dt><a href="#createUser">createUser(datasetUser, email, password)</a> ⇒ <code>string</code> | <code>undefined</code></dt>
<dd><p>Function that adds a new user record for a user when provided
with an email address and hashed password. Returns the new user id
when successful.</p>
</dd>
<dt><a href="#generateUrlShortcode">generateUrlShortcode()</a> ⇒ <code>string</code></dt>
<dd><p>Function that generates a random url identifier code</p>
</dd>
<dt><a href="#generateUserId">generateUserId()</a> ⇒ <code>string</code></dt>
<dd><p>Function that generates a random user identifier code</p>
</dd>
<dt><a href="#generateRandomString">generateRandomString(desiredLength, characterSet)</a> ⇒ <code>string</code></dt>
<dd><p>Function that returns a random string of a specified length from a
given set of characters</p>
</dd>
<dt><a href="#filterUrls">filterUrls(key, value, datasetUrl)</a> ⇒ <code>Object</code></dt>
<dd><p>Function that filters a given url dataset for a single key and value</p>
</dd>
<dt><a href="#filterUsers">filterUsers(key, value, datasetUser)</a> ⇒ <code>Object</code></dt>
<dd><p>Function that filters a given user dataset for a single key and value</p>
</dd>
<dt><a href="#validEmail">validEmail(email)</a> ⇒ <code>boolean</code></dt>
<dd><p>Function that validates a given email as an email address</p>
</dd>
<dt><a href="#validPassword">validPassword(password)</a> ⇒ <code>boolean</code></dt>
<dd><p>Function that validates a given plaintext password</p>
</dd>
<dt><a href="#validUrl">validUrl(password)</a> ⇒ <code>boolean</code></dt>
<dd><p>Function that validates a given url</p>
</dd>
</dl>

<a name="createTinyUrl"></a>

## createTinyUrl(datasetUrl, userId, longUrl) ⇒ <code>string</code> \| <code>undefined</code>
Function that adds a new tiny url record for a given user and url
and returns the tiny url shortcode when successful

**Kind**: global function
**Returns**: <code>string</code> \| <code>undefined</code> - The tiny url code

| Param | Type | Description |
| --- | --- | --- |
| datasetUrl | <code>Object</code> | The dataset to add the record to |
| userId | <code>string</code> | The owner of the record |
| longUrl | <code>string</code> | The long form url that users will be redirected to if they request this tiny url |

<a name="createUser"></a>

## createUser(datasetUser, email, password) ⇒ <code>string</code> \| <code>undefined</code>
Function that adds a new user record for a user when provided
with an email address and hashed password. Returns the new user id
when successful.

**Kind**: global function
**Returns**: <code>string</code> \| <code>undefined</code> - The new user id

| Param | Type | Description |
| --- | --- | --- |
| datasetUser | <code>Object</code> | The dataset to add the record to |
| email | <code>string</code> | The user's email address |
| password | <code>string</code> | The hashed password for this user |

<a name="generateUrlShortcode"></a>

## generateUrlShortcode() ⇒ <code>string</code>
Function that generates a random url identifier code

**Kind**: global function
**Returns**: <code>string</code> - The new url identifier code
<a name="generateUserId"></a>

## generateUserId() ⇒ <code>string</code>
Function that generates a random user identifier code

**Kind**: global function
**Returns**: <code>string</code> - The new user identifier code
<a name="generateRandomString"></a>

## generateRandomString(desiredLength, characterSet) ⇒ <code>string</code>
Function that returns a random string of a specified length from a
given set of characters

**Kind**: global function
**Returns**: <code>string</code> - A randomized string

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| desiredLength | <code>number</code> | <code>0</code> | Total characters desired |
| characterSet | <code>string</code> |  | The character set from which to select random characters |

<a name="filterUrls"></a>

## filterUrls(key, value, datasetUrl) ⇒ <code>Object</code>
Function that filters a given url dataset for a single key and value

**Kind**: global function
**Returns**: <code>Object</code> - The filtered results

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | The property key to match |
| value | <code>string</code> | The property value to match |
| datasetUrl | <code>Object</code> | The dataset from which to look |

<a name="filterUsers"></a>

## filterUsers(key, value, datasetUser) ⇒ <code>Object</code>
Function that filters a given user dataset for a single key and value

**Kind**: global function
**Returns**: <code>Object</code> - The filtered results

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | The property key to match |
| value | <code>string</code> | The property value to match |
| datasetUser | <code>Object</code> | The dataset from which to look |

<a name="validEmail"></a>

## validEmail(email) ⇒ <code>boolean</code>
Function that validates a given email as an email address

**Kind**: global function
**Returns**: <code>boolean</code> - When valid, returns true

| Param | Type | Description |
| --- | --- | --- |
| email | <code>string</code> | The email to evaluate |

<a name="validPassword"></a>

## validPassword(password) ⇒ <code>boolean</code>
Function that validates a given plaintext password

**Kind**: global function
**Returns**: <code>boolean</code> - When valid, returns true

| Param | Type | Description |
| --- | --- | --- |
| password | <code>string</code> | The plaintext password to evaluate |

<a name="validUrl"></a>

## validUrl(password) ⇒ <code>boolean</code>
Function that validates a given url

**Kind**: global function
**Returns**: <code>boolean</code> - When valid, returns true

| Param | Type | Description |
| --- | --- | --- |
| password | <code>string</code> | The plaintext password to evaluate |
