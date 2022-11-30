const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const userData = getUserByEmail("user@example.com", testUsers)
    const testUser = 'userRandomID'
    const expectedUserData = testUsers[testUser];
    assert.deepEqual(userData, expectedUserData)
  });

  it('should return undefined if the given email does not exist in the dataset', function() {
    const userData = getUserByEmail("user1231@example.com", testUsers)
    const expectedUserData = undefined;
    assert.deepEqual(userData, expectedUserData)
  });
});