const PORT = 8080;

//starter libs and settings
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//helper function
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
}

//And we begin!
const urlDatabase = {
  "b2xVn2" : "http://lighthouselabs.ca",
  "9sm5xk" : "http://google.com"
};

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies['username']
  }
  res.render('urls_index', templateVars);
});

//FORM from /urls_new -> request to url/ with input body, input name = longURL.
//if long url entered exists, redirect to existing /urls/shortURL, else create and redirect.
app.post('/urls', (req, res) => {
  let site = req.body.longURL;
  if (site.substring(0,6) !== 'http://') {
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

// app.get('/hello', (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n")
// })

app.get('/urls/new', (req, res) => {
  const templateVars = {username: req.cookies['username']}
  res.render('urls_new', templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls/');
})

app.post('/urls/:shortURL/edit', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newLongURL;

  res.redirect('/urls/');
})

//LOGIN
app.post("/login", (req, res) => {
  let user = req.body.username;  
  res.cookie('username',user);
  res.redirect('/urls')
})

app.get('/logout', (req,res) => {
  res.clearCookie('username');
  res.redirect('/urls')
})

// :ID generates a object key 'ID' on the inbuilt req.params object with the value as per request.
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies['username']
  };  
  res.render('urls_show', templateVars);
})

//redirect to actual url using the short form.
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];  
  res.redirect(longURL);
})







app.listen(PORT, () => {
  console.log(`Test app listening on port ${PORT}`);
});


