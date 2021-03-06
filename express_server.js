const express = require("express");
//==============using bcrypt to store passwords securely=======
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
//===========import helper function==============
const { getUserByEmail, urlsForUser, generateRandomString, authenticateUserInfo } = require("./helpers.js");
const app = express();
const PORT = 8080; // default port 8080

app.use(cookieSession({
  name: 'session',
  keys: ['tinyapp'],
  maxAge: 24 * 60 * 60 * 1000
}));

app.use(bodyParser.urlencoded({ extended: true }));
//====================express app will use ejs template engine===========
app.set("view engine", "ejs");

//=========urls database========
const urlDatabase = {};
//=========user database========
const users = {};

//========This method will give all urls data in JSON format.==============
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//========This method will give all users data in JSON format.==============
app.get("/user.json", (req, res) => {
  res.json(users);
});


//==============To Login Page==========
app.get("/", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    return res.redirect("/urls");
  }
  res.render("login", { users: user });
});

//==============To URL page==================
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    const templateVars = {
      urls: urlsForUser(req.session.user_id, urlDatabase),
      users: user
    };
    res.render("urls_index", templateVars);
  } else {
    res.status(400).send("Please <a href='/login'> Login</a> or <a href='/register'> Register</a> to create/view tiny urls")
  }
});

//================To Register Page=================
app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    return res.redirect("/urls");
  }

  res.render("register", { users: user });
});

// =======================Create New User or Check if the User Id already Exist=================
app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const { error } = authenticateUserInfo(userEmail, userPassword, users);
  if (error) {
    return res
      .status(400)
      .send(`${error}. Please try again :  <a href="/register"> Register</a>`);
  } else {
    const user_id = generateRandomString();
    const hashPassword = bcrypt.hashSync(userPassword, 10);
    users[user_id] = {
      id: user_id,
      email: userEmail,
      password: hashPassword
    }
    req.session.user_id = user_id;
    res.redirect("/urls");
  }
});

//=================GET route to render the New URL================
app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    return res.render("urls_new", { users: user });
  }
  res.redirect("/login");
});

//=====================user can't create short url without login=====================
app.post("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    return res.render("urls_new", { users: user });
  }
  res.status(405).send("Not Authorized to create a new URL without Login <br/><a href ='/login'> Login here</a>");
});

// =====================Show User their Newly Created Link====================
app.get("/urls/:shortURL", (req, res) => {
  if (users[req.session.user_id]) {
    if (urlDatabase[req.params.shortURL]) {
      userURL = urlsForUser(users[req.session.user_id].id, urlDatabase);
      if (Object.keys(userURL).includes(req.params.shortURL)) {
        const templateVars =
        {
          shortURL: req.params.shortURL,
          longURL: urlDatabase[req.params.shortURL].longURL,
          users: users[req.session.user_id]
        };
        res.render("urls_show", templateVars);
      } else {

        res.status(401).send("Short URL does not exist. Please check <br/><a href='/urls'> Main page </a>");
      }
    } else {
      res
        .status(401)
        .send("Short URL does not exist. Please check <br/><a href='/urls'> Main page </a>");
    }
  } else {
    res
      .status(401)
      .send("Please <a href='/login'> Login </a> to continue ");
  }
});

//=================== Redirect any request to "/u/:shortURL" to its LongURL======================
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.status(404).send("Invalid short url");
  }
});

//============== Request POST /urls when form is submitted generating random string(shortURL)==================
app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    const newShortUrl = generateRandomString();
    const longNewURL = req.body.longURL;
    urlDatabase[newShortUrl] = {
      longURL: longNewURL,
      userID: user["id"]
    };
    res.redirect(`/urls/${newShortUrl}`);
  } else {
    res.status(401).send("Not Authorized to create a new URL without Login <br/><a href ='/login'> Login here</a>");
  }
});

//================= redirecting to associateed long url======================
app.post("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { shortURL, longURL, userID: req.session.user_id };
  res.redirect('/urls');
});

//=================== To Delete the URL====================
app.post("/urls/:shortURL/delete", (req, res) => {
  if (users[req.session.user_id]) {
    userURL = urlsForUser(users[req.session.user_id].id, urlDatabase);
    if (Object.keys(userURL).includes(req.params.shortURL)) {
      const shortURL = req.params.shortURL;
      delete urlDatabase[shortURL];
      res.redirect("/urls");
    } else {
      res.status(401).send("Not Authorized to delete this shortURL");
    }
  } else {
    res
      .status(401)
      .send("Not allowed to delete without login <br/><a href='/login'> Login here</a>");
  }
});

//=====================update long URL with the associated short url================
app.post("/urls/:shortURL", (req, res) => {
  if (users[req.session.user_id]) {
    if (urlDatabase[req.params.shortURL]) {
      userURL = urlsForUser(users[req.session.user_id].id, urlDatabase);
      if (Object.keys(userURL).includes(req.params.shortURL)) {
        const shortURL = req.params.shortURL;
        urlDatabase[shortURL] = {
          longURL: req.body.longURL,
          userID: req.session.user_id
        };
        res.redirect("/urls");
      } else {
        res.status(401).send("Short URL is not valid. Please check and try again");
      }
    } else {
      res
        .status(401)
        .send("Please check the short url <a href='/urls'> Home </a>")
    }
  } else {
    res
      .status(400)
      .send("Please <br/><a href='/login'> Login </a> or <a href='/register'> Register </a> first");
  }
})


// ================To Login Page====================
app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    return res.redirect("/urls");
  }
  return res.render("login", { users: user });
});


//============= Check the Email and Password to Login==============
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (!user) {
    res
      .status(403)
      .send(`Invalid User Please try again <a href ='/login'> Login </a>`);
  } else {

    if (!bcrypt.compareSync(password, user.password)) {
      res.status(403).send("Invalid password Please try again <a href ='/login'> Login </a>");
    }
    req.session.user_id = user["id"];
    res.redirect("/urls");
  }
});

//=========== Logout =======================
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//================= app is listening on the configured port=================
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

module.exports = { users };
















// Request POST /urls when form is submitted generating random string(shortURL)
//shortURL-longURL key-value pair are saved to the urlDatabase.

app.post("/urls", (req, res) => {
  const newShortUrl = generateRandomString();
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
})






/*
  When user edits existing url and submit, then this methods takes modifies URL and saves to urlsDB and redicts to /urls link to show all urls with edit one.
*/
app.post("/urls/:id", (req, res) => {
  const { id } = req.params;
  const { longURL } = req.body;
  urlDatabase[id] = { "longURL": longURL, "userID": userID["id"] };
  res.redirect('/urls');
});













