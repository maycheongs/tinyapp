const express = require('express');
const app = express();

const PORT = 8080;

const urlDatabase = [{                       //an object (i.e. object/array)
  "b2xVn2" : "http://lighthouselabs.ca",
  "9sm5xk" : "http://google.com"
}];

app.get('/', (req, res) => {
  res.send('Hello');                            //works like .write
});

app.get('/urls', (req, res) => {
  res.json(urlDatabase);              //.json does JSON.stringify on an object automatically
});


app.listen(PORT, () => {
  console.log(`Test app listening on port ${PORT}`);
});

