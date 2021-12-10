const express = require("express");
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const {getUserByEmail} = require("./helpers.js");
const { urlsForUser } = require("./helpers");
const app = express();
const PORT = 8080; // default port 8080
app.use(cookieParser());
let user = {};
const validateShortURLForUser = {};
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
// app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

const users = { 
  "aJ48lW": {
    id: "aJ48lW", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}



app.get("/", (req, res) => {
  res.send("login");
});

/*
  This method will give all users data in JSON format.
*/
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/user.json", (req, res) => {
  res.json(users);
});

 
  // To Login Page
  app.get("/", (req, res) => {                  
    res.render("login", { user: null });
  });

  // To URL page
app.get("/urls", (req, res) => {
   const user = users[req.cookies["user_id"]];
//   //console.log(cookie);
//   //console.log(users[cookie]);
//   const templateVars = {
//     users: users[cookie],
//     urls: urlDatabase[req.params.shortURL]["longURL"]
//   };
// res.render("urls_index", templateVars);

if (user) {
  const templateVars = {
      urls: urlsForUser(req.cookies["user_id"], urlDatabase),
      users: user
  };
  console.log(templateVars.urls);
  console.log(req.cookies["user_id"]);
  res.render("urls_index", templateVars);
} else {
  res.status(400).send("Please <a href='/login'> Login</a> or <a href='/register'> Register</a> to create/view tiny urls")
}
});

// To Register Page
app.get("/register", (req, res) => {
  const templateVars = {
    users: req.cookies["user_id"]
  }
     res.render("register", templateVars);
});

// Create New User or Check if the User Id already Exist
app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  if (userEmail === "" || userPassword === "") {
    return res
    .status(400)
    .send(`{error}. Please try again :  <a href="/register"> Register</a>`);
  }
    if (getUserByEmail(userEmail, users)) {
     return res
      .status(400)
      .send(`{useralreadyexist}. Please try again :  <a href="/register"> Register</a>`);
    }

    const hashPassword = bcrypt.hashSync(userPassword, 10);
  users[user_id] = {
    id: user_id,
    email: userEmail,
    password: hashPassword
   }
   console.log(users);
  res.cookie("user_id", user_id);
  // console.log(user_id);
  // console.log(users);
    res.redirect("/urls");
  });

//GET route to render the New URL
app.get("/urls/new", (req, res) => { 
  const cookie = req.cookies["user_id"];
  const templateVars = {users:users[cookie]}; 
res.render("urls_new", templateVars);
});

app.post("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {
      return res.render("urls_new", {users: user});
  }
  res.status(405).send("Not Authorized to create a new URL without Login <br/><a href ='/login'> Login here</a>");
});

 // Show User their Newly Created Link
 app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  // const {longURL , userID} = urlDatabase[shortURL];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: JSON.stringify(urlDatabase[shortURL].longURL),
    users: users[req.cookies["user_id"]]
  };
  console.log(urlDatabase);
  console.log(req.params.shortURL);
  console.log(templateVars.longURL);
    res.render("urls_show", templateVars);
});

// Redirect any request to "/u/:shortURL" to its LongURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  console.log(longURL);
 res.redirect(longURL);
});

// Request POST /urls when form is submitted generating random string(shortURL)
app.post("/urls", (req, res) => {
//   const newUrl = generateRandomString();
//    const longURL = req.body.longURL;
//   urlDatabase[newUrl] = longURL;
//   res.redirect("/urls");
//  console.log(req.body);

 const user = users[req.cookies["user_id"]];
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

// For Editting the URL
app.post("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {shortURL,longURL,userID: req.cookies["user_id"]};
  res.redirect('/urls');
});

// To Delete the URL
app.post("/urls/:shortURL/delete", (req, res) => {
  if (users[req.cookies["user_id"]]) {
      userURL = urlsForUser(users[req.cookies["user_id"]].id, urlDatabase);
      console.log(urlDatabase);
      console.log(userURL);
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
          .send("Not allowed to delete without login <br/><a href='/login'> Login here</a>")
  }
});

app.post("/urls/:shortURL", (req, res) => {
  if (users[req.cookies["user_id"]]) {
    if (urlDatabase[req.params.shortURL]) {
        userURL = urlsForUser(users[req.cookies["user_id"]].id, urlDatabase);
        if (Object.keys(userURL).includes(req.params.shortURL)) {
            const shortURL = req.params.shortURL;
            urlDatabase[shortURL] = {
                longURL: req.body.longURL,
                userID: req.cookies["user_id"]
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
        .send("Please <br/><a href='/login'> Login </a> or <a href='/register'> Register </a> first")
}
})


// To Login Page
app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {
    //req.cookie.user_id = user.i;
    return res.redirect("/urls");
  }
  return res.render("login", {users: user});
});


// Check the Email and Password to Login
app.post("/login", (req, res) => {
  const email = (req.body.email);
  //console.log(email);
  //console.log("body ", req.body);
  const user = getUserByEmail(email, users);
  if (!user) {
      res
    .status(403)
    .send(`Invalid User Please try again <a href ='/login'> Login </a>`);
  } else {
  const password = req.body.password;
    if (!bcrypt.compareSync(password, user.password)) {
      res.status(403).send("Invalid password Please try again <a href ='/login'> Login </a>")
    } else {
  res.cookie("user_id", user["id"]);
  res.redirect("/urls");
    }
  }
});
  
// Logout 
app.post("/logout", (req, res) => {
  //console.log("cookie", req.cookies);
  res.clearCookie("user_id");
  res.redirect('/login');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

module.exports = {users};






  

  
  
 

  



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
  const {id} = req.params;
  const {longURL} = req.body;
  urlDatabase[id] = {"longURL" : longURL , "userID" : userID["id"] };
  res.redirect('/urls');
});



 









