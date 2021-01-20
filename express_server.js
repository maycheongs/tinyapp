const PORT = 8080;

//SETUP
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//helper functions
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

const emailExists = (usersObj, email) => {
  for (let userID in usersObj) {
    if (usersObj[userID].email === email) {
      return true;
    }
  }
  return false;
};

const getUserID = (usersObj, email) => {
  for (let userID in usersObj) {
    if (usersObj[userID].email === email) {
      return userID;
    }
  }
}

const isPassword = (usersObj, email, password) => {
  for (let userID in usersObj) {
    if (usersObj[userID].email === email) {
      let user = usersObj[userID];
      if (user.password === password) {
        return true;
      }
    }
  }
  return false;
}

//DATABASES
const urlDatabase = {
  "b2xVn2" : "http://lighthouselabs.ca",
  "9sm5xk" : "http://google.com"
};

const users = {
  "testID": {
    id: "testID",
    name: "testname",
    email: "test@test.com",
    password: "password"
  }
}

//ROUTES

// /HOMEPAGE
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users,
    user: req.cookies['user_id']
  }
  res.render('urls_index', templateVars);
});

//ADDING A NEW URL ENTRY
app.get('/urls/new', (req, res) => {

  if (!req.cookies['user_id']) {
    res.redirect('/login');
    return;
  } else {
  const templateVars = {
    users,
    user: req.cookies['user_id']
  };
  res.render('urls_new', templateVars);
  }
});

app.post('/urls', (req, res) => {
  let site = req.body.longURL;
  if (site.substring(0,7) !== 'http://') {
    site = 'http://' + site;
  }
  for (let short in urlDatabase) {
    if (site === urlDatabase[short]) {
      console.log('Exists!');
      res.redirect(`/urls/${short}`)
      return;
    }
  }
  const newId = generateRandomString(6);
  urlDatabase[newId] = site;
  res.redirect(`/urls/${newId}`);
})


//EDITING/DELETING URL ENTRIES
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: req.cookies['user_id'],
    users
  };  
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls/');
})

app.post('/urls/:shortURL/edit', (req, res) => {
  let longURL = req.body.newLongURL;
  if (longURL.substring(0,7) !== "http://") {
    longURL = 'http://' + longURL;
  }
  urlDatabase[req.params.shortURL] = longURL;
  
  res.redirect('/urls/');
})


//GOING TO THE LONG URL
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];  
  res.redirect(longURL);
})


// REGISTRATION
app.get('/register', (req, res) => {
  const templateVars = {user: req.cookies['user_id']};
  res.render('registration', templateVars);
});

app.post('/register', (req, res) => { 
  let email = req.body.email;
  let name = req.body.name || email; //logs in after successful registration. Displays name if included else email.
  let password = req.body.password;
  if (emailExists(users, email)) {
    res.send(`Error 400: Bad Request - That email is already registered.\n Go back to <a href="/register">Sign Up</a>?`);
    return;
  }
  if (email === '' || password === '') {
    res.send(`Error 400: Bad Request - Field entries cannot be empty.\n Go back to <a href="/register">Sign Up</a>?`);
    return;
  }
  let newID = generateRandomString(4);
  users[newID] = {
    id: newID,
    name,
    email,
    password
  };
  console.log(users);
  res.cookie('user_id', newID)
  res.redirect('/urls');
});

// LOGIN/LOGOUT

app.get('/login', (req, res) => {
  const templateVars = {
    users,
    user: req.cookies['user_id']
  };
  res.render('loginform', templateVars)
})
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (email === '' || password === '') {
    res.send(`Error 400: Bad Request - Field entries cannot be empty.\n Go back to <a href="/login">Log in</a>?`);
    return;
  }
  if (!emailExists(users, email)) {
    res.send(`Error 403: Forbidden - That email is not registered. Please <a href="/register">register</a> first.`);
    return;
  }
  if (isPassword(users,email,password)) {
    res.cookie('user_id',getUserID(users,email));
    res.redirect('/urls');
    return;
  }
  res.send(`Error 403: Forbidden - Password invalid. \n Go back to <a href="/login">Log in</a>?`);  
})

app.post('/logout', (req,res) => {
  res.clearCookie('user_id');
  res.redirect('/urls')
})




//*****************************************************************
app.listen(PORT, () => {
  console.log(`Test app listening on port ${PORT}`);
});


