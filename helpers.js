const bcrypt = require('bcrypt');
const saltRounds = 10;

const generateRandomString = num => {
  let string = '';
  while (num > 0) {
    let char = Math.random().toString(36)[2];
    if (Math.random() < 0.5) {
      char = char.toUpperCase()
    }
    string += char;
    num--;
  }
  return string;
};

const emailExists = (users, email) => {
  for (let userID in users) {
    if (users[userID].email === email) {
      return true;
    }
  }
  return false;
};

const getIdByEmail = (users, email) => {
  for (let userID in users) {
    if (users[userID].email === email) {
      return userID;
    }
  }
}

const isPassword = (users, email, password) => {
  for (let userID in users) {
    let user = users[userID];
    if (user.email === email) {      
      return bcrypt.compareSync(password, user.password);      
    }
  }
  return false;
}

const urlsForUser = (urlDatabase,id) => {
  let userUrls = {}
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return userUrls;
}


module.exports = { 
  generateRandomString,
  emailExists,
  getIdByEmail,
  isPassword,
  urlsForUser
};