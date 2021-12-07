const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080
const users = {};
const user = {};
function generateRandomString() {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
};
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

/*
  This method will give all users data in JSON format.
*/
app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });
// To URL page
  app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  });

// Request POST /urls when form is submitted generating random string(shortURL)
  app.post("/urls", (req, res) => {
    const newUrl = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[newUrl] = longURL;
    res.redirect("/urls");
   console.log(req.body);
  });

  /*
  When user edits existing url and submit, then this methods takes modifies URL and saves to urlsDB and redicts to /urls link to show all urls with edit one.
*/
app.post("/urls/:id", (req, res) => {
    const {id} = req.params;
    const {longURL} = req.body;
    urlDatabase[id] = {"longURL" : longURL , "userID" : userID["id"] };
    res.redirect('/urls');
  });
  
  //GET route to render the New URL

  app.get("/urls/new", (req, res) => {
    const templateVars = { "user" : user};
    res.render("urls_new",templateVars);
  });

  // Show User their Newly Created Link
app.get("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[shortURL].longURL
    };
    
      res.render("urls_show", templateVars);
  });

  app.get("/u/:shortURL", (req, res) => {
     const shortURL = req.params.shortURL;
     const longURL = urlDatabase[shortURL];
     console.log(longURL);
    res.redirect(longURL);
  });

  // Request POST /urls when form is submitted generating random string(shortURL)
//shortURL-longURL key-value pair are saved to the urlDatabase.
app.post("/urls", (req, res) => {
    const newUrl = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[newUrl] = {
      longURL: longURL
    };
    res.redirect("/urls");
  });
       

  app.get("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: req.params.longURL
    }
    res.render("urls_show", templateVars);
});



  app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });



//   app.get("/set", (req, res) => {
//     const a = 1;
//     res.send(`a = ${a}`);
//    });
   
//    app.get("/fetch", (req, res) => {
//     res.send(`a = ${a}`);
//    });

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});