const PORT = 8080;
const express = require('express');
const app = express();

// MIDDLEWARE & HELPERS
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const userId = (req, res, next) => {
  req.userId = req.session['user_id'];
  next();
}
const timeNow = (req, res, next) => {
  req.timeNow = Date.now();
  next();
}
const { 
  generateRandomString,
  emailExists,
  getIdByEmail,
  isPassword,
  urlsForUser
} = require('./helpers')


app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
  })
);
app.use(morgan('tiny'));
app.use(userId);
app.use(timeNow);


// DATABASES
const urlDatabase = {
  "b2xVn2" : {longURL: "http://lighthouselabs.ca", userID: "testID"},
  "9sm5xk" : {longURL: "http://google.com", userID: "testID"}
};

const users = {
  "testID": {
    id: "testID",
    name: "testname",
    email: "test@test.com",
    password: "$2b$10$N3/DPHOw2f8OuAOZqC6PiuJNlEy1pq4L//r/E8YyDHkrAMnZ1zeHO" //'password'
  }
}

//ROUTES

// /HOMEPAGE and MAIN
app.get('/', (req, res) => {
  if (req.userId) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get('/urls', (req, res) => {

  const templateVars = {
    urls: urlsForUser(urlDatabase,req.userId),
    user: users[req.userId] //user object
  }
  res.render('urls_index', templateVars);
});

// ADD A NEW URL ENTRY
app.get('/urls/new', (req, res) => {

  if (!req.userId) {                         //if not logged in, redirect to log-in page.
    res.redirect('/login');
    return;
  } else {
  const templateVars = {
    user: users[req.userId]
  };
  res.render('urls_new', templateVars);
  }
});

app.post('/urls', (req, res) => {
  let site = req.body.longURL;
  if (site.substring(0,7) !== 'http://') {        //if "http://" is not prefixed, add the prefix.
    site = 'http://' + site;
  }
  let urls = urlsForUser(urlDatabase,req.userId);
  for (let shortURL in urls) {
    if (site === urls[shortURL]) {
      console.log('Exists!');
      res.redirect(`/urls/${shortURL}`)               //if url already exists in the user's list, show existing shorturl
      return;
    }
  }
  const newShortURL = generateRandomString(6);
  urlDatabase[newShortURL] = {
    longURL: site, userID: req.userId
  }
  res.redirect(`/urls/${newShortURL}`);
})


// EDITING/DELETING URL ENTRIES
app.get('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.send(`Error 404: Not Found. Go back to <a href="/urls">home</a>.`)   //if doesn't exist display error + home link
    return;
  }
  const ownerId = urlDatabase[shortURL].userID;

  if (req.userId !== ownerId) {
    res.send(`Error 401: Not Authorised. If you are the owner, please <a href='/login'>log in</a> to view this page.`);
    return;
  }
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[req.userId]    
  };  
  res.render('urls_show', templateVars);
});


app.put('/urls/:shortURL', (req, res) => {
  let longURL = req.body.newLongURL;
  if (longURL.substring(0,7) !== "http://") {
    longURL = 'http://' + longURL;
  }
  let shortURL = req.params.shortURL;
  let status = 302;
  if (urlDatabase[shortURL].userID === req.userId) {      //if entry belongs to logged-in user
    urlDatabase[shortURL].longURL = longURL;
  } else {
    status = 401;
  }
  res.redirect(status,'/urls/');
})

app.delete('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL
  let status = 302;
  if (urlDatabase[shortURL].userID === req.userId) {
  delete urlDatabase[req.params.shortURL];
  } else {
    status = 401;
  }
  res.redirect(status,'/urls/');
})

// GOING TO THE LONG URL
app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL
  if (!urlDatabase[shortURL]) {
    res.send(`Error 404: Not found - the short URL does not exist`)
  } else {
  const longURL = urlDatabase[req.params.shortURL].longURL;  
  res.redirect(longURL);
  }
});


// REGISTRATION
app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.userId],
  };
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
    res.send(`Error 400: Bad Request - Email/Password cannot be empty.\n Go back to <a href="/register">Sign Up</a>?`);
    return;
  }
  let newID = generateRandomString(4);
  users[newID] = {
    id: newID,
    name,
    email,
    password: bcrypt.hashSync(password, saltRounds)
  };
  //console.log(users);
  req.session['user_id'] = newID
  res.redirect('/urls');
});

// LOGIN/LOGOUT

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.userId],
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
    req.session['user_id'] = getIdByEmail(users,email);
    res.redirect('/urls');
    return;
  }
  res.send(`Error 403: Forbidden - Password invalid. \n Go back to <a href="/login">Log in</a>?`);  
})

app.post('/logout', (req,res) => {
  req.session = null;
  res.redirect('/urls')
})




//*****************************************************************
app.listen(PORT, () => {
  console.log(`Test app listening on port ${PORT}`);
});


