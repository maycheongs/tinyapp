const { assert } = require('chai');

const { getUserID } = require('../helpers.js');

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

describe('#getUserID', function() {
  it('should return a user with valid email', function() {
    const user = getUserID(testUsers,"user@example.com")
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput)
  });
  it('should return undefined when passed an email that is not in the database', function() {
    const user = getUserID(testUsers,"none@example.com")
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput)
  });
});