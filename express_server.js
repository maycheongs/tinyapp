const express = require('express');
const app = express();
app.set('view engine', 'ejs');

const PORT = 8080;

const urlDatabase = {                       //an object (i.e. object/array)
  "b2xVn2" : "http://lighthouselabs.ca",
  "9sm5xk" : "http://google.com"
};

// //home page
// app.get('/', (req, res) => {
//   //res.send('Hello');                           default express- works like .write
//   res.render('pages/index');
// });

// //about page
// app.get('/about',(req, res) => {
//   res.render('pages/about');
// });


app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase}
  res.render('urls_index', templateVars);              //.json does JSON.stringify on an object automatically
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
})


app.listen(PORT, () => {
  console.log(`Test app listening on port ${PORT}`);
});


