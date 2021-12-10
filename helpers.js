const getUserByEmail = (email,users) => {
    console.log(email);
    for (const key in users) {
        if (users[key].email === email) {
             return users[key];
        }
        }
        return false;
    };


    const urlsForUser = (ID, urlDatabase) => {
        const accessUrls = {};
        for (const url in urlDatabase) {
            if (urlDatabase[url].userID === ID) {
                accessUrls[url] = urlDatabase[url]

                //     longURL: urlDatabase[url].longURL ,
                //     userID: userID
                // };
            }
        } 
        return accessUrls;
    };
    


  module.exports = {getUserByEmail, urlsForUser}; 

