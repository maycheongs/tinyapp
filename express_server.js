
//starter code
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

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
const PORT = 8080;
const urlDatabase = {
  "b2xVn2" : "http://lighthouselabs.ca",
  "9sm5xk" : "http://google.com"
};

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase}
  res.render('urls_index', templateVars);
});

//FORM from /urls_new -> request to url/ with input body, input name = longURL.
//if long url entered exists, redirect to existing /urls/shortURL, else create and redirect.
app.post('/urls', (req, res) => {
  let site = req.body.longURL;
  for (let short in urlDatabase) {
    if (site === urlDatabase[short]) {
      console.log('Exists!');
      res.redirect(`/urls/${short}`)
      return;
    }
  }
  const newId = generateRandomString(6);
  urlDatabase[newId] = req.body.longURL;
  res.redirect(`/urls/${newId}`);
})

// app.get('/hello', (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n")
// })

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

// :ID generates a object key 'ID' on the inbuilt req.params object with the value as per request.
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  console.log(req.params)
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


